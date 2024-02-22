import { workspace, ExtensionContext, window, commands } from 'vscode'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Executable,
} from 'vscode-languageclient/node'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

function getExecutable(isDebug: boolean): Executable {
  const command = workspace
    .getConfiguration('astGrep')
    .get('serverPath', 'ast-grep')
  return {
    command,
    args: ['lsp'],
    options: {
      env: {
        ...process.env,
        ...(isDebug ? { RUST_LOG: 'debug' } : {}),
      },
      // shell is required for Windows cmd to pick up global npm binary
      shell: true,
    },
  }
}

/**
 * Set up language server/client
 */
export function activateLsp(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('ast-grep.restartLanguageServer', async () => {
      console.log(
        'Restart the ast-grep language server by ast-grep.restart command',
      )
      await restart()
    }),
    workspace.onDidChangeConfiguration(async changeEvent => {
      if (changeEvent.affectsConfiguration('astGrep')) {
        console.log(
          'Restart the ast-grep language server due to modification of vscode settings',
        )
        await restart()
      }
    }),
  )

  // instantiate and set input which updates the view
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run: getExecutable(false),
    debug: getExecutable(true),
  }

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    diagnosticCollectionName,
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: '*' }],
    outputChannel: window.createOutputChannel(outputChannelName),
  }

  // Create the language client and start the client.
  client = new LanguageClient(
    languageClientId,
    languageClientName,
    serverOptions,
    clientOptions,
  )

  // Start the client. This will also launch the server
  client.start()
}

async function restart(): Promise<void> {
  await deactivate()
  if (client) {
    await client.start()
  }
}

function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
