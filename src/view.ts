import type { ParentPort, SgSearch } from './types'
import { execa } from 'execa'
import { Unport, ChannelMessage } from 'unport'
import * as vscode from 'vscode'
import { workspace } from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const provider = new SearchSidebarProvider(context.extensionUri)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SearchSidebarProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  )
}

async function getPatternRes(pattern: string) {
  if (!pattern) {
    return
  }
  let command = workspace.getConfiguration('astGrep').get('serverPath', 'sg')
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []

  // TODO: use ast-grep lsp to optimize the performance
  // TODO: multi-workspaces support
  const { stdout } = await execa(
    command,
    ['run', '--pattern', pattern, '--json'],
    { cwd: uris[0] }
  )

  try {
    let res: SgSearch[] = JSON.parse(stdout)
    return res
  } catch (e) {
    console.error(e)
    return []
  }
}

class SearchSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ast-grep.search.panel'

  private _view?: vscode.WebviewView

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview)

    const parentPort: ParentPort = new Unport()

    parentPort.implementChannel({
      async send(message) {
        webviewView.webview.postMessage(message)
      },
      accept(pipe) {
        webviewView.webview.onDidReceiveMessage((message: ChannelMessage) => {
          pipe(message)
        })
      }
    })
    parentPort.onMessage('reload', _payload => {
      const nonce = getNonce()
      webviewView.webview.html = webviewView.webview.html.replace(
        /(nonce="\w+?")|(nonce-\w+?)/g,
        `nonce="${nonce}"`
      )
    })

    parentPort.onMessage('search', async payload => {
      const res = (await getPatternRes(payload.inputValue)) ?? []
      parentPort.postMessage('search', { ...payload, searchResult: res })
    })
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const localPort = 3000
    const localServerUrl = `http://localhost:${localPort}/index.js`

    const scriptUri =
      process.env.NODE_ENV !== 'production'
        ? localServerUrl
        : webview.asWebviewUri(
            vscode.Uri.joinPath(
              this._extensionUri,
              'out',
              'webview',
              'index.js'
            )
          )

    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    )
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    )

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce()

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesResetUri}" rel="stylesheet"">
        <link href="${stylesMainUri}" rel="stylesheet"">
      </head>
      <body>
        <div id="root"></div>
        <script id="main-script" type="module" src="${scriptUri}" nonce="${nonce}"></script>
      </body>
    </html>`
  }
}

function getNonce() {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
