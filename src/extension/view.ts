import type { Definition, ParentPort } from '../types'
import { Unport, ChannelMessage } from 'unport'
import * as vscode from 'vscode'
import { workspace, window } from 'vscode'
import { generatePreview } from './replacePreview'

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
  )
}

function openFile({
  filePath,
  locationsToSelect,
}: Definition['child2parent']['openFile']) {
  const uris = workspace.workspaceFolders
  const { joinPath } = vscode.Uri

  if (!uris?.length) {
    return
  }

  const fileUri: vscode.Uri = joinPath(uris?.[0].uri, filePath)
  let range: undefined | vscode.Range
  if (locationsToSelect) {
    const { start, end } = locationsToSelect
    range = new vscode.Range(
      new vscode.Position(start.line, start.column),
      new vscode.Position(end.line, end.column),
    )
  }
  vscode.commands.executeCommand('vscode.open', fileUri, {
    selection: range,
  })
}

export async function previewReplace({
  filePath,
  locationsToSelect,
}: Definition['child2parent']['openFile']) {
  const uris = workspace.workspaceFolders
  const { joinPath } = vscode.Uri
  if (!uris?.length) {
    return
  }
  const fileUri: vscode.Uri = joinPath(uris?.[0].uri, filePath)
  await generatePreview(fileUri)
  const previewUri = fileUri.with({ scheme: 'sgpreview' })
  // const previewUri = vscode.Uri.parse('inmemoryfile://ast-grep/preview')
  await vscode.commands.executeCommand('vscode.diff', fileUri, previewUri)
  if (locationsToSelect) {
    const { start, end } = locationsToSelect
    const range = new vscode.Range(
      new vscode.Position(start.line, start.column),
      new vscode.Position(end.line, end.column),
    )
    window.activeTextEditor?.revealRange(range)
  }
}

export const parentPort: ParentPort = new Unport()

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

parentPort.onMessage('openFile', async payload => openFile(payload))

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
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'index.js'),
    )
    const stylexUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'index.css'),
    )

    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'),
    )
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'),
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
        <link href="${stylexUri}" rel="stylesheet"">
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
