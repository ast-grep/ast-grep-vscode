// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import path from 'node:path'
import {
  type CancellationToken,
  commands,
  EventEmitter,
  type ExtensionContext,
  Position,
  Range,
  TabInputTextDiff,
  type TextDocument,
  type TextDocumentContentProvider,
  TextEditorRevealType,
  Uri,
  window,
  workspace,
} from 'vscode'
import type { ChildToParent, Diff, DisplayResult, SearchQuery, SgSearch } from '../types'
import { parentPort, streamedPromise } from './common'
import { buildCommand, splitByHighLightToken } from './search'

const SCHEME = 'sgpreview'
let lastPattern = ''
let lastRewrite = ''

/**
 * NB A file will only have one preview at a time
 * last rewrite will replace older rewrites
 * key: path, value: string content
 */
const previewContents: Map<string, string> = new Map()

class AstGrepPreviewProvider implements TextDocumentContentProvider {
  private emitter = new EventEmitter<Uri>()
  onDidChange = this.emitter.event

  // TODO: add cancellation
  provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
    return previewContents.get(uri.path) || ''
  }

  notifyDiffChange(uri: Uri) {
    this.emitter.fire(uri)
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

function locationToRange(
  locations: ChildToParent['previewDiff']['locationsToSelect'],
) {
  const { start, end } = locations
  return new Range(
    new Position(start.line, start.column),
    new Position(end.line, end.column),
  )
}

function openFile({ filePath, locationsToSelect }: ChildToParent['openFile']) {
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  const range = locationToRange(locationsToSelect)
  commands.executeCommand('vscode.open', fileUri, {
    selection: range,
    preserveFocus: true,
  })
}

async function previewDiff(param: ChildToParent['previewDiff']) {
  const { filePath, diffs } = param
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  // if preview not in the preview provider, generate it
  if (!previewContents.has(fileUri.path)) {
    await generatePreview(fileUri, diffs)
  }
  doPreview(fileUri, param)
}

function isMatchingPreviewUri(uri: Uri | undefined, previewUri: Uri) {
  return uri?.scheme === SCHEME && uri.path === previewUri.path
}

async function doPreview(
  fileUri: Uri,
  { filePath, locationsToSelect }: ChildToParent['previewDiff'],
) {
  const previewUri = fileUri.with({
    scheme: SCHEME,
    query: Date.now().toString(),
  })
  const filename = path.basename(filePath)
  const range = locationToRange(locationsToSelect)
  const activeEditor = window.activeTextEditor
  // if the preview is already open, reveal it directly
  // calling diff again will close the previous window
  // and delete entry previewContents
  if (isMatchingPreviewUri(activeEditor?.document.uri, previewUri)) {
    activeEditor?.revealRange(range, TextEditorRevealType.InCenter)
    return
  }
  // https://github.com/microsoft/vscode/blob/d63202a5382aa104f5515ea09053a2a21a2587c6/src/vs/workbench/api/common/extHostApiCommands.ts#L422
  await commands.executeCommand(
    'vscode.diff',
    fileUri,
    previewUri,
    `${filename} ↔ ${filename} (Replace Preview)`,
    {
      preserveFocus: true,
      revealIfVisible: true,
    },
  )
  activeEditor?.revealRange(range, TextEditorRevealType.InCenter)
}

async function dismissDiff(param: ChildToParent['dismissDiff']) {
  const { filePath, diffs } = param
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  // if preview not in the preview provider, skip generate
  if (!previewContents.has(fileUri.path)) {
    return
  }
  await generatePreview(fileUri, diffs)
  // update the preview snapshot
  const previewUri = fileUri.with({ scheme: SCHEME })
  previewProvider.notifyDiffChange(previewUri)
}

function closeAllDiffs() {
  console.debug('Search pattern changed. Closing all diffs.')
  const tabs = window.tabGroups.all.flatMap(tg => tg.tabs)
  for (const tab of tabs) {
    const input = tab.input
    if (input instanceof TabInputTextDiff && isSgPreviewUri(input.modified)) {
      window.tabGroups.close(tab, true)
    }
  }
}

function refreshDiff(query: SearchQuery) {
  try {
    // Clear cache if pattern/rewrite changed
    if (query.pattern !== lastPattern || query.rewrite !== lastRewrite) {
      previewContents.clear()
    }
    if (query.pattern !== lastPattern) {
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
    lastPattern = query.pattern
    lastRewrite = query.rewrite
  }
}
parentPort.onMessage('openFile', openFile)
parentPort.onMessage('previewDiff', previewDiff)
parentPort.onMessage('dismissDiff', dismissDiff)
parentPort.onMessage('search', refreshDiff)
parentPort.onMessage('commitChange', onCommitChange)
parentPort.onMessage('replaceAll', onReplaceAll)

async function onReplaceAll(payload: ChildToParent['replaceAll']) {
  const confirmed = await window.showInformationMessage(
    'Replace all occurrences across all files?',
    { modal: true },
    'Replace',
  )
  if (confirmed !== 'Replace') {
    return
  }
  const { id, pattern, rewrite, selector, strictness, lang } = payload
  for (const change of payload.changes) {
    // TODO: chunk change
    await onCommitChange({
      id,
      pattern,
      rewrite,
      selector,
      strictness,
      lang,
      ...change,
    })
  }
}

async function onCommitChange(payload: ChildToParent['commitChange']) {
  const { filePath, pattern, rewrite, strictness, selector, lang } = payload
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  await doChange(fileUri, payload)
  await refreshSearchResult(payload.id, fileUri, {
    pattern,
    rewrite,
    strictness,
    selector,
    lang,
    includeFile: filePath,
  })
}

async function doChange(
  fileUri: Uri,
  { diffs }: ChildToParent['commitChange'],
) {
  const bytes = await workspace.fs.readFile(fileUri)
  const { receiveResult, conclude } = bufferMaker(bytes)
  for (const { range, replacement } of diffs) {
    receiveResult(replacement, range.byteOffset)
  }
  const final = conclude()
  await workspace.fs.writeFile(fileUri, final)
}

async function refreshSearchResult(
  id: number,
  fileUri: Uri,
  query: SearchQuery,
) {
  const command = buildCommand(query)
  const bytes = await workspace.fs.readFile(fileUri)
  const { receiveResult, conclude } = bufferMaker(bytes)
  const updatedResults: DisplayResult[] = []
  await streamedPromise(command!, (results: SgSearch[]) => {
    for (const r of results) {
      receiveResult(r.replacement!, r.range.byteOffset)
      updatedResults.push(splitByHighLightToken(r))
    }
  })
  const final = conclude()
  const replaced = new TextDecoder('utf-8').decode(final)
  previewContents.set(fileUri.path, replaced)
  previewProvider.notifyDiffChange(fileUri)
  parentPort.postMessage('refreshSearchResult', {
    id,
    updatedResults,
    fileName: query.includeFile,
  })
}

/**
 *  set up replace preview and open file
 */
export function activatePreview({ subscriptions }: ExtensionContext) {
  subscriptions.push(
    workspace.registerTextDocumentContentProvider(SCHEME, previewProvider),
    workspace.onDidCloseTextDocument(cleanupDocument),
  )
}

function bufferMaker(bytes: Uint8Array) {
  const encoder = new TextEncoder()
  let newBuffer = new Uint8Array(bytes.byteLength)
  let srcOffset = 0
  let destOffset = 0
  function resizeBuffer() {
    const temp = new Uint8Array(newBuffer.byteLength * 2)
    temp.set(newBuffer)
    newBuffer = temp
  }
  function receiveResult(
    replace: string,
    byteOffset: { start: number; end: number },
  ) {
    // skip overlapping replacement
    if (byteOffset.start < srcOffset) {
      return
    }
    const slice = bytes.slice(srcOffset, byteOffset.start)
    const replacement = encoder.encode(replace)
    const expectedLength = destOffset + slice.byteLength + replacement.byteLength
    while (expectedLength > newBuffer.byteLength) {
      resizeBuffer()
    }
    newBuffer.set(slice, destOffset)
    destOffset += slice.byteLength
    newBuffer.set(replacement, destOffset)
    destOffset += replacement.byteLength
    srcOffset = byteOffset.end
  }
  function conclude() {
    const slice = bytes.slice(srcOffset, bytes.byteLength)
    while (destOffset + slice.byteLength > newBuffer.byteLength) {
      resizeBuffer()
    }
    newBuffer.set(slice, destOffset)
    return newBuffer.slice(0, destOffset + slice.byteLength)
  }
  return {
    receiveResult,
    conclude,
  }
}

async function generatePreview(uri: Uri, diffs: Diff[]) {
  // TODO, maybe we also need a rewrite change event?
  const bytes = await workspace.fs.readFile(uri)
  const { receiveResult, conclude } = bufferMaker(bytes)
  for (const { range, replacement } of diffs) {
    receiveResult(replacement, range.byteOffset)
  }
  const final = conclude()
  const replaced = new TextDecoder('utf-8').decode(final)
  previewContents.set(uri.path, replaced)
}
