import {
  getMatchHighlightStyle,
  getMatchHighlightStyleSecondary
} from './codeHighlightSettings'
import type { ParentPort, SgSearch } from './types'
import { execa } from 'execa'
import { Unport, ChannelMessage } from 'unport'
import * as vscode from 'vscode'
import { workspace } from 'vscode'

type Match = any

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
      webviewView.webview.html = webviewView.webview.html.replace(
        /nonce="\w+?"/,
        `nonce="${getNonce()}"`
      )
    })

    parentPort.onMessage('search', async payload => {
      const res = (await getPatternRes(payload.inputValue)) ?? []
      parentPort.postMessage('search', { ...payload, searchResult: res })
    })

    parentPort.onMessage('openfile', async payload => this.openFile(payload))
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
        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script id="main-script" type="module" src="${scriptUri}" nonce="${nonce}">
      </body>
    </html>`
  }

  private getPositionsFromMatchLocation = (matchLocation: Match['loc']) => {
    const startPos = new vscode.Position(
      matchLocation.start.line - 1, // API has 0-based indexes
      matchLocation.start.column
    )
    const endPos = new vscode.Position(
      matchLocation.end.line - 1, // API has 0-based indexes
      matchLocation.end.column
    )

    return [startPos, endPos] as const
  }

  private openFile = ({
    filePath,
    locationsToSelect,
    locationsToDecorate
  }: {
    filePath: string
    locationsToSelect?: Array<Match['loc']>
    locationsToDecorate?: Array<Match['loc']>
  }) => {
    // TODO: multi workspaces support
    const uris = workspace.workspaceFolders
    const { joinPath } = vscode.Uri

    if (!uris?.length) {
      return
    }

    const setting: vscode.Uri = joinPath(uris?.[0].uri, filePath)

    vscode.workspace.openTextDocument(setting).then(
      async (textDoc: vscode.TextDocument) => {
        let mainSelection = undefined

        if (locationsToSelect?.[0]) {
          mainSelection = {
            selection: new vscode.Range(
              ...this.getPositionsFromMatchLocation(locationsToSelect?.[0])
            )
          }
        }

        const selectLikeCodeDecoration =
          vscode.window.createTextEditorDecorationType({
            light: getMatchHighlightStyle(false),
            dark: getMatchHighlightStyle(true)
          })

        const selectLikeCodeDecorationSecondary =
          vscode.window.createTextEditorDecorationType({
            light: getMatchHighlightStyleSecondary(false),
            dark: getMatchHighlightStyleSecondary(true)
          })

        return vscode.window
          .showTextDocument(textDoc, mainSelection)
          .then(() => {
            if (vscode.window.activeTextEditor) {
              const selections = locationsToSelect
                ? locationsToSelect.map(
                    locationToSelect =>
                      new vscode.Selection(
                        ...this.getPositionsFromMatchLocation(locationToSelect)
                      )
                  )
                : []

              const selectionDecorations: vscode.DecorationOptions[] = []
              const secondaryDecorations: vscode.DecorationOptions[] = []

              locationsToDecorate?.forEach(locationToDecorate => {
                const rangeToDecorate = new vscode.Range(
                  ...this.getPositionsFromMatchLocation(locationToDecorate)
                )
                const hasMatchingSelection = selections.some(selection =>
                  selection.isEqual(rangeToDecorate)
                )

                if (hasMatchingSelection) {
                  selectionDecorations.push({
                    range: rangeToDecorate
                  })
                } else {
                  secondaryDecorations.push({ range: rangeToDecorate })
                }
              })

              if (secondaryDecorations.length > 0) {
                vscode.window.activeTextEditor.setDecorations(
                  selectLikeCodeDecorationSecondary,
                  secondaryDecorations
                )
              }

              // Apply selectionDecorations after secondary, so selection overlaps in case of intersection of ranges
              if (selectionDecorations.length > 0) {
                vscode.window.activeTextEditor.setDecorations(
                  selectLikeCodeDecoration,
                  selectionDecorations
                )
              }

              if (locationsToSelect && locationsToSelect.length > 1) {
                vscode.window.activeTextEditor.selections = selections
              }
            }
          })
      },
      (error: any) => {
        console.error('error opening file', filePath)
        console.error(error)
      }
    )
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
