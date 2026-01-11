import spawn, { type Subprocess } from 'nano-spawn'
import path from 'node:path'
import { commands, type ExtensionContext, window, workspace } from 'vscode'

import type { DisplayResult, PatternQuery, SearchQuery, SgSearch, YAMLConfig } from '../types'
import { normalizeCommandForWindows, parentPort, resolveBinary, streamedPromise } from './common'

/**
 * Set up search query handling and search commands
 */
export function activateSearch(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('ast-grep.searchInFolder', findInFolder),
    commands.registerCommand('ast-grep.searchByCode', searchByCode),
  )
}

// biome-ignore lint/suspicious/noExplicitAny: todo
function findInFolder(data: any) {
  const workspacePath = workspace.workspaceFolders?.[0]?.uri?.fsPath
  // compute relative path to the workspace folder
  const relative = workspacePath && path.relative(workspacePath, data.fsPath)
  if (!relative) {
    window.showErrorMessage('ast-grep Error: folder is not in the workspace')
    return
  }
  commands.executeCommand('ast-grep.search.input.focus')
  parentPort.postMessage('setIncludeFile', {
    includeFile: relative,
  })
}

const LEADING_SPACES_RE = /^\s*/
const PRE_CTX = 30
const POST_CTX = 100

export function splitByHighLightToken(search: SgSearch): DisplayResult {
  const { start, end } = search.range
  let startIdx = start.column
  let endIdx = end.column
  let displayLine = search.lines
  // multiline matches! only display the first line!
  if (start.line < end.line) {
    displayLine = search.lines.split(/\r?\n/, 1)[0]
    endIdx = displayLine.length
  }
  // strip leading spaces
  const leadingSpaces = displayLine.match(LEADING_SPACES_RE)?.[0].length
  if (leadingSpaces) {
    displayLine = displayLine.substring(leadingSpaces)
    startIdx -= leadingSpaces
    endIdx -= leadingSpaces
  }
  // TODO: improve this rendering logic
  // truncate long lines
  if (startIdx > PRE_CTX + 3) {
    displayLine = '...' + displayLine.substring(startIdx - PRE_CTX)
    const length = endIdx - startIdx
    startIdx = PRE_CTX + 3
    endIdx = startIdx + length
  }
  if (endIdx + POST_CTX + 3 < displayLine.length) {
    displayLine = displayLine.substring(0, endIdx + POST_CTX) + '...'
  }
  return {
    startIdx,
    endIdx,
    displayLine,
    lineSpan: end.line - start.line,
    file: search.file,
    range: search.range,
    language: search.language,
    ...handleReplacement(search.replacement),
  }
}

function handleReplacement(replacement?: string) {
  if (replacement) {
    return { replacement }
  }
  return {}
}

type StreamingHandler = (r: SgSearch[]) => void
let child: Subprocess | undefined

async function uniqueCommand(
  proc: Subprocess | undefined,
  handler: StreamingHandler,
) {
  // kill previous search
  if (child) {
    const childProc = await child.nodeChildProcess
    childProc.kill('SIGTERM')
  }
  if (!proc) {
    return Promise.resolve()
  }
  try {
    // set current proc to child
    child = proc
    await streamedPromise(proc, handler)
    // unset child only when the promise succeed
    // interrupted proc will be replaced by latter proc
    child = undefined
  } catch (e) {
    console.info('search aborted: ', e)
  }
}

// TODO: add unit test for commandBuilder
export function buildCommand(query: SearchQuery) {
  if ('yaml' in query) {
    return buildYAMLCommand(query)
  } else {
    return buildPatternCommand(query)
  }
}

function buildPatternCommand(query: PatternQuery) {
  const { pattern, includeFile, strictness } = query
  if (!pattern) {
    return
  }
  const command = resolveBinary()
  const { normalizedCommand, shell } = normalizeCommandForWindows(command)
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  const args = ['run', '--pattern', pattern, '--json=stream']
  if (query.selector) {
    args.push('--selector', query.selector)
  }
  if (query.rewrite) {
    args.push('--rewrite', query.rewrite)
  }
  if (strictness && strictness !== 'smart') {
    args.push('--strictness', strictness)
  }
  if (query.lang) {
    args.push('--lang', query.lang)
  }
  const validIncludeFile = includeFile.split(',').filter(Boolean)
  const hasGlobPattern = validIncludeFile.some(i => i.includes('*'))
  if (hasGlobPattern) {
    args.push(...validIncludeFile.map(i => `--globs=${i}`))
  } else {
    args.push(...validIncludeFile)
  }
  console.debug('running', query, normalizedCommand, args)
  // TODO: multi-workspaces support
  return spawn(normalizedCommand, args, {
    shell,
    cwd: uris[0],
  })
}

interface Handlers {
  onData: StreamingHandler
  onError: (e: Error) => void
}

async function getPatternRes(query: SearchQuery, handlers: Handlers) {
  const proc = buildCommand(query)
  if (proc) {
    const childProc = await proc.nodeChildProcess
    childProc.on('error', (error: Error) => {
      console.debug('ast-grep CLI runs error')
      handlers.onError(error)
    })
  }
  return uniqueCommand(proc, handlers.onData)
}

function buildYAMLCommand(config: YAMLConfig) {
  const { yaml, includeFile } = config
  if (!yaml) {
    return
  }
  const command = resolveBinary()
  const { normalizedCommand, shell } = normalizeCommandForWindows(command)
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  const args = ['scan', '--inline-rules', yaml, '--json=stream']
  const validIncludeFile = includeFile.split(',').filter(Boolean)
  const hasGlobPattern = validIncludeFile.some(i => i.includes('*'))
  if (hasGlobPattern) {
    args.push(...validIncludeFile.map(i => `--globs=${i}`))
  } else {
    args.push(...validIncludeFile)
  }
  console.debug('scanning', config, normalizedCommand, args)
  // TODO: multi-workspaces support
  return spawn(normalizedCommand, args, {
    shell,
    cwd: uris[0],
  })
}

async function getYAMLRes(config: YAMLConfig, handlers: Handlers) {
  const proc = buildYAMLCommand(config)
  if (proc) {
    const childProc = await proc.nodeChildProcess
    childProc.on('error', (error: Error) => {
      console.debug('ast-grep CLI runs error')
      handlers.onError(error)
    })
  }
  return uniqueCommand(proc, handlers.onData)
}

parentPort.onMessage('search', async payload => {
  const onData = (ret: SgSearch[]) => {
    parentPort.postMessage('searchResultStreaming', {
      ...payload,
      searchResult: ret.map(splitByHighLightToken),
    })
  }
  await getPatternRes(payload, {
    onData,
    onError(error) {
      parentPort.postMessage('error', {
        error,
        ...payload,
      })
    },
  })
  parentPort.postMessage('searchEnd', payload)
})

parentPort.onMessage('yaml', async payload => {
  const onData = (ret: SgSearch[]) => {
    parentPort.postMessage('searchResultStreaming', {
      ...payload,
      searchResult: ret.map(splitByHighLightToken),
    })
  }
  await getYAMLRes(payload, {
    onData,
    onError(error) {
      parentPort.postMessage('error', {
        error,
        ...payload,
      })
    },
  })
  parentPort.postMessage('searchEnd', payload)
})

function searchByCode() {
  const editor = window.activeTextEditor
  if (!editor) {
    return
  }
  const selection = editor.selection
  const text = editor.document.getText(selection)
  commands.executeCommand('ast-grep.search.input.focus')
  parentPort.postMessage('searchByCode', { text })
}
