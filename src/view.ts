import type { Definition, ParentPort, SgSearch } from './types'
import { Unport, ChannelMessage } from 'unport'
import * as vscode from 'vscode'
import { workspace } from 'vscode'
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

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

let child: ChildProcessWithoutNullStreams | undefined

function streamedPromise(
  proc: ChildProcessWithoutNullStreams
): Promise<SgSearch[]> {
  // push all data into the result array
  let result: SgSearch[] = []
  // don't concatenate a single string/buffer
  // only maintain the last trailing line
  let trailingLine = ''
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
  }
  child = proc
  // stream parsing JSON
  child.stdout.on('data', (data: string) => {
    const lines = (trailingLine + data).split(/\r?\n/)
    trailingLine = ''
    for (let i = 0; i < lines.length; i++) {
      try {
        result.push(JSON.parse(lines[i]))
      } catch (e) {
        // only store the last non-json line
        if (i === lines.length - 1) {
          trailingLine = lines[i]
        }
      }
    }
  })
  return new Promise((resolve, reject) =>
    child!.on('exit', (code, signal) => {
      // exit without signal, search ends correctly
      // TODO: is it correct now?
      if (!signal && code === 0) {
        child = undefined
        resolve(result)
      } else {
        reject([code, signal])
      }
    })
  )
}

async function getPatternRes(pattern: string) {
  if (!pattern) {
    return
  }
  let command = workspace
    .getConfiguration('astGrep')
    .get('serverPath', 'ast-grep')
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []

  // TODO: multi-workspaces support
  let proc = spawn(command, ['run', '--pattern', pattern, '--json=stream'], {
    cwd: uris[0]
  })
  try {
    return await streamedPromise(proc)
  } catch (e) {
    console.error(e)
    return []
  }
}

function openFile({
  filePath,
  locationsToSelect
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
      new vscode.Position(end.line, end.column)
    )
  }

  vscode.commands.executeCommand('vscode.open', fileUri, {
    selection: range
  })
}

function setupParentPort(webviewView: vscode.WebviewView) {
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

  parentPort.onMessage('openFile', async payload => openFile(payload))
}

class SearchSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ast-grep.search.input'

  // @ts-expect-error
  private _view?: vscode.WebviewView

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview)
    setupParentPort(webviewView)
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'index.js')
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
