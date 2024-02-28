import path from 'path'
import { ExtensionContext, commands, workspace, window } from 'vscode'
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

import { parentPort, resolveBinary, streamedPromise } from './common'
import type { SgSearch, DisplayResult, SearchQuery } from '../types'

/**
 * Set up search query handling and search commands
 */
export function activateSearch(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('ast-grep.searchInFolder', findInFolder),
  )
}

function findInFolder(data: any) {
  const workspacePath = workspace.workspaceFolders?.[0].uri.fsPath
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
    ...handleReplacement(search.replacement),
  }
}

function handleReplacement(replacement?: string) {
  if (replacement) {
    return { replacement: replacement.split(/\r?\n/, 1)[0] }
  }
  return {}
}

type StreamingHandler = (r: SgSearch[]) => void
let child: ChildProcessWithoutNullStreams | undefined

async function uniqueCommand(
  proc: ChildProcessWithoutNullStreams,
  handler: StreamingHandler,
) {
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
  }
  try {
    // set current proc to child
    child = proc
    await streamedPromise(proc, handler)
    // unset child only when the promise succeed
    // interrupted proc will be replaced by latter proc
    child = undefined
  } catch (e) {
    console.info(`search aborted: `, e)
  }
}

interface CommandArgs {
  pattern: string
  rewrite?: string
  includeFiles: string[]
}

// TODO: add unit test for commandBuilder
export function buildCommand(query: CommandArgs) {
  const { pattern, includeFiles, rewrite } = query
  if (!pattern) {
    return
  }
  const command = resolveBinary()
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  const args = ['run', '--pattern', pattern, '--json=stream']
  if (rewrite) {
    args.push('--rewrite', rewrite)
  }
  args.push(...includeFiles.filter(Boolean))
  console.debug('running', query, command, args)
  // TODO: multi-workspaces support
  return spawn(command, args, {
    cwd: uris[0],
    // shell: true, // it is safe because it is end user input
  })
}

interface Handlers {
  onData: StreamingHandler
  onError: (e: Error) => void
}

function getPatternRes(query: SearchQuery, handlers: Handlers) {
  const proc = buildCommand({
    pattern: query.inputValue,
    includeFiles: [query.includeFile],
    rewrite: query.rewrite,
  })
  if (!proc) {
    return Promise.resolve()
  }
  proc.on('error', error => {
    console.debug('ast-grep CLI runs error')
    handlers.onError(error)
  })
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
