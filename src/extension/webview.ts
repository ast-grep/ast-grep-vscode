import type { ChannelMessage } from 'unport'
import { parentPort } from './common'
import * as vscode from 'vscode'
import { window, commands } from 'vscode'

/**
 * Set up webviews for UI display, e.g. sidebar.
 */
export function activateWebview(context: vscode.ExtensionContext) {
  const provider = new SearchSidebarProvider(context.extensionUri)

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      SearchSidebarProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
    commands.registerCommand('ast-grep.refreshSearch', refreshSearch),
    commands.registerCommand('ast-grep.clearSearchResults', clearSearchResults),
    commands.registerCommand('ast-grep.expandAll', toggleAllSearch),
    commands.registerCommand('ast-grep.collapseAll', toggleAllSearch),
  )
}

function setupParentPort(webviewView: vscode.WebviewView) {
  parentPort.implementChannel({
    async send(message) {
      webviewView.webview.postMessage(message)
    },
    accept(pipe) {
      webviewView.webview.onDidReceiveMessage((message: ChannelMessage) => {
        pipe(message)
      })
    },
  })
  parentPort.onMessage('reload', _payload => {
    const nonce = getNonce()
    webviewView.webview.html = webviewView.webview.html.replace(
      /(nonce="\w+?")|(nonce-\w+?)/g,
      `nonce="${nonce}"`,
    )
  })
}

class SearchSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ast-grep.search.input'

  // @ts-expect-error
  private _view?: vscode.WebviewView

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    }

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview)
    setupParentPort(webviewView)
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.js'),
    )
    const stylexUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.css'),
    )

    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'),
    )
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'),
    )
    const iconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'icons'),
    )

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce()

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link href="${stylesResetUri}" rel="stylesheet"">
        <link href="${stylesMainUri}" rel="stylesheet"">
        <link href="${stylexUri}" rel="stylesheet"">
      </head>
      <body>
        <div id="root"></div>
        <script>window.ICON_SRC = '${iconsUri}'</script>
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

function refreshSearch() {
  parentPort.postMessage('refreshAllSearch', {})
}

function clearSearchResults() {
  parentPort.postMessage('clearSearchResults', {})
}

let defaultCollapse = false

// reset default collapse when starting a new search
parentPort.onMessage('search', async () => {
  defaultCollapse = false
  vscode.commands.executeCommand(
    'setContext',
    'ast-grep.searchDefaultCollapse',
    false,
  )
})

function toggleAllSearch() {
  parentPort.postMessage('toggleAllSearch', {})
  defaultCollapse = !defaultCollapse
  vscode.commands.executeCommand(
    'setContext',
    'ast-grep.searchDefaultCollapse',
    defaultCollapse,
  )
}
