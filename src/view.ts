import type { Definition, ParentPort, SgSearch, DisplayResult } from './types'
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

const LEADING_SPACES_RE = /^\s*/

function splitByHighLightToken(search: SgSearch): DisplayResult {
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
  return {
    startIdx,
    endIdx,
    displayLine,
    lineSpan: end.line - start.line,
    file: search.file,
    range: search.range
  }
}

type StreamingHandler = (r: SgSearch[]) => void

let child: ChildProcessWithoutNullStreams | undefined
function streamedPromise(
  proc: ChildProcessWithoutNullStreams,
  handler: StreamingHandler
): Promise<number> {
  // don't concatenate a single string/buffer
  // only maintain the last trailing line
  let trailingLine = ''
  // stream parsing JSON
  proc.stdout.on('data', (data: string) => {
    // collect results in this batch
    let result: SgSearch[] = []
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
    handler(result)
  })
  return new Promise((resolve, reject) =>
    proc.on('exit', (code, signal) => {
      // exit without signal, search ends correctly
      // TODO: is it correct now?
      if (!signal && code === 0) {
        resolve(code)
      } else {
        reject([code, signal])
      }
    })
  )
}

async function uniqueCommand(
  proc: ChildProcessWithoutNullStreams,
  handler: StreamingHandler
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
    console.error(e)
  }
}

async function getPatternRes(pattern: string, handler: StreamingHandler) {
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
  return uniqueCommand(proc, handler)
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
    await getPatternRes(payload.inputValue, ret => {
      parentPort.postMessage('searchResultStreaming', {
        ...payload,
        searchResult: ret.map(splitByHighLightToken)
      })
    })
    parentPort.postMessage('searchEnd', payload)
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
