// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import {
  CancellationToken,
  ExtensionContext,
  Position,
  Range,
  TextDocument,
  TextDocumentContentProvider,
  Uri,
  commands,
  window,
  workspace,
  TextEditorRevealType,
  TabInputTextDiff,
} from 'vscode'
import type { ChildToParent, SearchQuery, SgSearch } from '../types'
import { parentPort, streamedPromise } from './common'
import { buildCommand, splitByHighLightToken } from './search'
import path from 'path'

const SCHEME = 'sgpreview'
let lastPattern = ''
let lastRewrite = ''

/**
 * NB A file will only have one preview at a time
 * last rewrite will replace older rewrites
 * key: path, value: string content
 **/
const previewContents: Map<string, string> = new Map()

class AstGrepPreviewProvider implements TextDocumentContentProvider {
  // TODO: add cancellation
  provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
    return previewContents.get(uri.path) || ''
  }
}
const previewProvider = new AstGrepPreviewProvider()

function isSgPreviewUri(uri: Uri) {
  return uri.scheme === SCHEME
}

function cleanupDocument(doc: TextDocument) {
  const uri = doc.uri
  if (!isSgPreviewUri(uri)) {
    return
  }
  previewContents.delete(uri.path)
}

function workspaceUriFromFilePath(filePath: string) {
  const uris = workspace.workspaceFolders
  const { joinPath } = Uri
  if (!uris?.length) {
    return
  }
  return joinPath(uris?.[0].uri, filePath)
}

function openFile({ filePath, locationsToSelect }: ChildToParent['openFile']) {
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  let range: undefined | Range
  if (locationsToSelect) {
    const { start, end } = locationsToSelect
    range = new Range(
      new Position(start.line, start.column),
      new Position(end.line, end.column),
    )
  }
  commands.executeCommand('vscode.open', fileUri, {
    selection: range,
    preserveFocus: true,
  })
}

async function previewDiff({
  filePath,
  locationsToSelect,
  inputValue,
  rewrite,
}: ChildToParent['previewDiff']) {
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  await generatePreview(fileUri, inputValue, rewrite)
  const previewUri = fileUri.with({ scheme: SCHEME })
  const filename = path.basename(filePath)
  // https://github.com/microsoft/vscode/blob/d63202a5382aa104f5515ea09053a2a21a2587c6/src/vs/workbench/api/common/extHostApiCommands.ts#L422
  await commands.executeCommand(
    'vscode.diff',
    fileUri,
    previewUri,
    `${filename} ↔ ${filename} (Replace Preview)`,
    {
      preserveFocus: true,
    },
  )
  if (locationsToSelect) {
    const { start, end } = locationsToSelect
    const range = new Range(
      new Position(start.line, start.column),
      new Position(end.line, end.column),
    )
    window.activeTextEditor?.revealRange(range, TextEditorRevealType.InCenter)
  }
}
function closeAllDiffs() {
  console.debug('Search pattern changed. Closing all diffs.')
  const tabs = window.tabGroups.all.flatMap(tg => tg.tabs)
  for (const tab of tabs) {
    const input = tab.input
    if (input instanceof TabInputTextDiff && isSgPreviewUri(input.modified)) {
      window.tabGroups.close(tab)
    }
  }
}

function refreshDiff(query: SearchQuery) {
  try {
    if (query.inputValue !== lastPattern) {
      closeAllDiffs()
      return
    }
    if (query.rewrite === lastRewrite) {
      return
    }
    // TODO: refresh diff content!
    closeAllDiffs()
  } finally {
    // use finally to ensure updated
    lastPattern = query.inputValue
    lastRewrite = query.rewrite
  }
}
parentPort.onMessage('openFile', openFile)
parentPort.onMessage('previewDiff', previewDiff)
parentPort.onMessage('search', refreshDiff)
parentPort.onMessage('commitChange', onCommitChange)

async function onCommitChange(payload: ChildToParent['commitChange']) {
  const { filePath, inputValue, rewrite } = payload
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  await doChange(fileUri, payload)
  await generatePreview(fileUri, inputValue, rewrite)
  await refreshSearchResult(payload.id, {
    inputValue,
    rewrite,
    includeFile: filePath,
  })
}

async function doChange(
  fileUri: Uri,
  { range, replacement }: ChildToParent['commitChange'],
) {
  const bytes = await workspace.fs.readFile(fileUri)
  const replaceBytes = new TextEncoder().encode(replacement)
  const newBytes = new Uint8Array(bytes.byteLength + replaceBytes.byteLength)
  newBytes.set(bytes.slice(0, range.byteOffset.start), 0)
  newBytes.set(replaceBytes, range.byteOffset.start)
  newBytes.set(
    bytes.slice(range.byteOffset.end),
    range.byteOffset.start + replaceBytes.byteLength,
  )
  await workspace.fs.writeFile(fileUri, newBytes)
}

async function refreshSearchResult(id: number, query: SearchQuery) {
  const command = buildCommand({
    pattern: query.inputValue,
    rewrite: query.rewrite,
    includeFiles: [query.includeFile],
  })
  await streamedPromise(command!, (results: SgSearch[]) => {
    // TODO, change this
    parentPort.postMessage('searchResultStreaming', {
      id,
      ...query,
      searchResult: results.map(splitByHighLightToken),
    })
  })
}

/**
 *  set up replace preview and open file
 **/
export function activatePreview({ subscriptions }: ExtensionContext) {
  subscriptions.push(
    workspace.registerTextDocumentContentProvider(SCHEME, previewProvider),
    workspace.onDidCloseTextDocument(cleanupDocument),
  )
}

interface ReplaceArg {
  bytes: Uint8Array
  uri: Uri
  inputValue: string
  rewrite: string
}

async function haveReplace({ bytes, uri, inputValue, rewrite }: ReplaceArg) {
  const command = buildCommand({
    pattern: inputValue,
    rewrite: rewrite,
    includeFiles: [uri.fsPath],
  })
  let newBuffer = new Uint8Array(bytes.byteLength)
  let srcOffset = 0
  let destOffset = 0
  function resizeBuffer() {
    const newNewBuffer = new Uint8Array(newBuffer.byteLength * 2)
    newNewBuffer.set(newBuffer)
    newBuffer = newNewBuffer
  }
  const encoder = new TextEncoder()
  await streamedPromise(command!, (results: SgSearch[]) => {
    for (const r of results) {
      // skip overlapping replacement
      if (r.range.byteOffset.start < srcOffset) {
        continue
      }
      const slice = bytes.slice(srcOffset, r.range.byteOffset.start)
      const replacement = encoder.encode(r.replacement!)
      const expectedLength =
        destOffset + slice.byteLength + replacement.byteLength
      while (expectedLength > newBuffer.byteLength) {
        resizeBuffer()
      }
      newBuffer.set(slice, destOffset)
      destOffset += slice.byteLength
      newBuffer.set(replacement, destOffset)
      destOffset += replacement.byteLength
      srcOffset = r.range.byteOffset.end
    }
  })
  const slice = bytes.slice(srcOffset, bytes.byteLength)
  while (destOffset + slice.byteLength > newBuffer.byteLength) {
    resizeBuffer()
  }
  newBuffer.set(slice, destOffset)
  const final = newBuffer.slice(0, destOffset + slice.byteLength)
  return new TextDecoder('utf-8').decode(final)
}

async function generatePreview(uri: Uri, inputValue: string, rewrite: string) {
  if (previewContents.has(uri.path)) {
    return
  }
  // TODO, maybe we also need a rewrite change event?
  // TODO, implement close preview on new search at first
  const bytes = await workspace.fs.readFile(uri)
  const replaced = await haveReplace({
    bytes,
    uri,
    inputValue,
    rewrite,
  })
  previewContents.set(uri.path, replaced)
}
