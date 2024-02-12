import {
  workspace,
  ExtensionContext,
  window,
  commands,
  Range,
  TreeItem,
  TreeItemLabel,
  TreeItemCollapsibleState,
  TreeDataProvider,
  TextDocumentShowOptions,
  Uri,
  ThemeIcon,
  EventEmitter,
  Position
} from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Executable
} from 'vscode-languageclient/node'

import { activate as activateWebview } from './view'
import { SgSearch } from './types'

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
  file: string
}

interface SearchItem {
  file: string
  source: string
  range: Range
}
class AstGrepScanTreeItem extends TreeItem {
  constructor(public item: FileItem | SearchItem) {
    let label
    let collapsibleState = TreeItemCollapsibleState.None
    if ('source' in item) {
      const { start, end } = item.range
      label = {
        label: item.source,
        highlights: [[start.character, end.character]]
      } as TreeItemLabel
    } else {
      label = item.file
      collapsibleState = TreeItemCollapsibleState.Expanded
    }
    super(label, collapsibleState)
    if ('source' in item) {
      this.command = {
        title: 'ast-grep',
        command: 'vscode.open',
        arguments: [
          this.uri,
          <TextDocumentShowOptions>{
            selection: item.range
          }
        ]
      }
    }
  }

  get uri() {
    // Get the current workspace folder
    const workspaceFolder = workspace.workspaceFolders![0]
    // Join the workspace folder path with the relative path
    const filePath = Uri.joinPath(workspaceFolder.uri, this.item.file)
    return filePath
  }

  static isSearchItem(item: FileItem | SearchItem): item is SearchItem {
    return 'source' in item
  }
}

type Dictionary<T> = { [key: string]: T }
export class AstGrepSearchResultProvider
  implements TreeDataProvider<AstGrepScanTreeItem>
{
  private scanResultDict: Dictionary<SgSearch[]> = {}
  private emitter = new EventEmitter<undefined>()
  onDidChangeTreeData = this.emitter.event

  getTreeItem(element: AstGrepScanTreeItem): TreeItem {
    // only add iconPath if the element is not a file item
    if (!('source' in element.item)) {
      element.contextValue = 'file-item'
      element.description = true
      element.iconPath = ThemeIcon.File
      element.resourceUri = element.uri
    }
    return element
  }

  getChildren(element?: AstGrepScanTreeItem): Thenable<AstGrepScanTreeItem[]> {
    if (!element) {
      let list = Object.keys(this.scanResultDict).map(file => {
        return new AstGrepScanTreeItem({ file })
      })
      return Promise.resolve(list)
    }
    if (AstGrepScanTreeItem.isSearchItem(element.item)) {
      return Promise.resolve([])
    }
    let file = element.item.file
    let list = this.scanResultDict[file].map(item => {
      const { start, end } = item.range
      return new AstGrepScanTreeItem({
        file: item.file,
        source: item.lines,
        range: new Range(
          new Position(start.line, start.column),
          new Position(end.line, end.column)
        )
      })
    })
    return Promise.resolve(list)
  }

  updateResult(res: SgSearch[]) {
    let grouped = groupBy(res, 'file')
    this.scanResultDict = grouped
    this.emitter.fire(undefined)
  }
}

function activateLsp(context: ExtensionContext) {
  let provider = new AstGrepSearchResultProvider()

  window.createTreeView('ast-grep.search.result', {
    treeDataProvider: provider,
    showCollapseAll: false
  })
  context.subscriptions.push(
    commands.registerCommand('ast-grep.search', async _uri => {
      // TODO: change impl
      // let curWorkspace = workspace.workspaceFolders?.[0]
      // if (!curWorkspace) {
      //   return
      // }
      // let pattern
      // try {
      //   pattern = await window.showInputBox({})
      // } catch {
      //   return
      // }
      // if (!pattern) {
      //   return
      // }
      // let res = await client.sendRequest<ScanResult[]>('ast-grep/search', {
      //   pattern: pattern
      // })
      // provider.updateResult(res)
    }),
    commands.registerCommand('ast-grep.restartLanguageServer', async () => {
      console.log(
        'Restart the ast-grep language server by ast-grep.restart command'
      )
      await restart()
    }),
    workspace.onDidChangeConfiguration(async changeEvent => {
      if (changeEvent.affectsConfiguration('astGrep')) {
        console.log(
          'Restart the ast-grep language server due to modification of vscode settings'
        )
        await restart()
      }
    })
  )

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

  // TODO: fix shit code
  return provider
}

export function activate(context: ExtensionContext) {
  const provider = activateLsp(context)
  // TODO: fix shit code
  activateWebview(context, provider)
}

async function restart(): Promise<void> {
  await deactivate()
  if (client) {
    await client.start()
  }
}

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
