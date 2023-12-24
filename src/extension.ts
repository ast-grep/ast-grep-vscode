import {
  workspace,
  ExtensionContext,
  window,
  extensions,
  commands,
  Range,
  TreeItem,
  TreeItemCollapsibleState,
  TreeDataProvider,
  Position,
  TextDocumentShowOptions,
  TextDocument,
  Uri,
  ThemeIcon
} from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Executable
} from 'vscode-languageclient/node'

import { activate as activateWebview } from './view'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

function getExecutable(isDebug: boolean): Executable {
  const command = workspace.getConfiguration('astGrep').get('serverPath', 'sg')
  return {
    command,
    args: ['lsp'],
    options: {
      env: {
        ...process.env,
        ...(isDebug ? { RUST_LOG: 'debug' } : {})
      },
      // shell is required for Windows cmd to pick up global npm binary
      shell: true
    }
  }
}

interface FileItem {
  uri: string
}

interface SearchItem {
  uri: string
  source: string
  range: Range
}
class AstGrepScanTreeItem extends TreeItem {
  constructor(public item: FileItem | SearchItem) {
    let label = ''
    let collapsibleState = TreeItemCollapsibleState.None
    if ('source' in item) {
      label = item.source
    } else {
      label = workspace.asRelativePath(Uri.parse(item.uri))
      collapsibleState = TreeItemCollapsibleState.Expanded
    }
    super(label, collapsibleState)
    if ('source' in item) {
      this.command = {
        title: 'ast-grep',
        command: 'vscode.open',
        arguments: [
          item.uri,
          <TextDocumentShowOptions>{
            selection: item.range
          }
        ]
      }
    }
  }

  static isFileItem(item?: FileItem | SearchItem): item is FileItem {
    if (item) {
      return 'uri' in item
    } else {
      return false
    }
  }

  static isSearchItem(item?: FileItem | SearchItem): item is SearchItem {
    if (item) {
      return 'source' in item
    } else {
      return false
    }
  }
}

type Dictionary<T> = { [key: string]: T }
export class NodeDependenciesProvider
  implements TreeDataProvider<AstGrepScanTreeItem>
{
  constructor(private scanResultDict: Dictionary<ScanResult[]>) {
    // @ts-ignore
    this.provider = this
  }

  getTreeItem(element: AstGrepScanTreeItem): TreeItem {
    // only add iconPath if the element is not a file item
    if (!('source' in element.item)) {
      element.contextValue = 'file-item'
      element.description = true
      element.iconPath = ThemeIcon.File
      element.resourceUri = Uri.parse(element.item.uri)
    }
    return element
  }

  getChildren(element?: AstGrepScanTreeItem): Thenable<AstGrepScanTreeItem[]> {
    if (AstGrepScanTreeItem.isSearchItem(element?.item)) {
      return Promise.resolve([])
    }
    if (element) {
      let uri = element.item.uri
      let list = this.scanResultDict[uri].map(item => {
        return new AstGrepScanTreeItem({
          uri: item.uri,
          source: item.content,
          range: item.position
        })
      })
      return Promise.resolve(list)
    } else {
      let list = Object.keys(this.scanResultDict).map(key => {
        return new AstGrepScanTreeItem({ uri: key })
      })
      return Promise.resolve(list)
    }
  }
}

interface ScanResult {
  uri: string
  // Same as vscode.Range but all zero-based
  position: Range
  content: string
}

function activateLsp(context: ExtensionContext) {
  let disposable = commands.registerCommand('ast-grep.search', async _uri => {
    let curWorkspace = workspace.workspaceFolders?.[0]
    if (!curWorkspace) {
      return
    }
    const referenceView = await extensions
      .getExtension('vscode.references-view')
      ?.activate()
    let pattern
    try {
      pattern = await window.showInputBox({})
    } catch {
      return
    }
    if (!pattern) {
      return
    }
    let res = await client.sendRequest<ScanResult[]>('ast-grep/search', {
      pattern: pattern
    })

    let treeItemList: AstGrepScanTreeItem[] = []
    let grouped = groupBy(res, 'uri')
    for (let uri of Object.keys(grouped)) {
      let scanResultList = grouped[uri]
      for (let element of scanResultList) {
        treeItemList.push(
          new AstGrepScanTreeItem({
            source: element.content,
            range: element.position,
            uri: element.uri
          })
        )
      }
    }
    let provider = new NodeDependenciesProvider(grouped)

    let symbolTreeInput = {
      contextValue: 'ast-grep',
      title: 'ast-grep',
      location: {
        uri: window.activeTextEditor?.document.uri,
        range: new Range(new Position(0, 0), new Position(0, 0))
      },
      resolve() {
        return provider
      },
      with() {
        return symbolTreeInput
      }
    }
    referenceView.setInput(symbolTreeInput)
  })

  context.subscriptions.push(disposable)

  // instantiate and set input which updates the view
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run: getExecutable(false),
    debug: getExecutable(true)
  }

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    diagnosticCollectionName,
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: '*' }],
    outputChannel: window.createOutputChannel(outputChannelName)
  }

  // Create the language client and start the client.
  client = new LanguageClient(
    languageClientId,
    languageClientName,
    serverOptions,
    clientOptions
  )

  // Start the client. This will also launch the server
  client.start()
}

export function activate(context: ExtensionContext) {
  activateLsp(context)
  activateWebview(context)
}

workspace.onDidChangeConfiguration(changeEvent => {
  if (changeEvent.affectsConfiguration('astGrep')) {
    deactivate()
    client.start()
  }
})

export function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}

function groupBy<T extends object>(obj: T[], key: keyof T) {
  return obj.reduce(
    (acc, cur) => {
      let k = cur[key] as string
      if (!acc[k]) {
        acc[k] = []
      }
      acc[k].push(cur)
      return acc
    },
    {} as Record<string, T[]>
  )
}
