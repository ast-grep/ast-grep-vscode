// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import {
  CancellationToken,
  ExtensionContext,
  TextDocument,
  TextDocumentContentProvider,
  Uri,
  workspace,
} from 'vscode'

const SCHEME = 'sgpreview'

const _documents: { [key: string]: MemoryFile } = {}
let _lastDocId: number = 0

function getDocument(uri: Uri): MemoryFile | null {
  return _documents[uri.path]
}

function _getNextDocId(): string {
  _lastDocId++
  return '_' + _lastDocId + '_'
}

function createDocument(extension = '') {
  let path = _getNextDocId()

  if (extension != '') path += '.' + extension

  let self = new MemoryFile(path)

  _documents[path] = self

  return self
}

/**
 * NB A file will only have one preview at a time
 **/
export class MemoryFile {
  public static getDocument(uri: Uri): MemoryFile | null {
    return getDocument(uri)
  }

  public static createDocument(extension = '') {
    return createDocument(extension)
  }

  public content: string = ''
  public uri: Uri

  constructor(path: string) {
    this.uri = Uri.from({ scheme: SCHEME, path: path })
  }

  public write(strContent: string) {
    this.content += strContent
  }

  public read(): string {
    return this.content
  }

  public getUri(): Uri {
    return this.uri
  }
}

class AstGrepPreviewProvider implements TextDocumentContentProvider {
  // TODO: add cancellation and onClose cleanup
  provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
    let memDoc = MemoryFile.getDocument(uri)
    return memDoc?.read() || ''
  }
}

function cleanupDocument(_doc: TextDocument) {
  // TODO
}

/**
 *  Registration function for preview files.
 *  You need to call this once, if you want to make use of
 *  `MemoryFile`s.
 **/
export function registerPreviewProvider({ subscriptions }: ExtensionContext) {
  const previewProvider = new AstGrepPreviewProvider()
  subscriptions.push(
    workspace.registerTextDocumentContentProvider(SCHEME, previewProvider),
    workspace.onDidCloseTextDocument(cleanupDocument),
  )
}

export function generatePreview(
  _file: string,
  _pattern: string,
  _rewrite: string,
) {
  // TODO, maybe we also need a rewrite change event?
  // TODO, implement close preview on new search at first
  // TODO
}
