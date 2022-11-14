import { workspace, ExtensionContext, window } from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Executable
} from 'vscode-languageclient/node'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

function getExecutable(isDebug: boolean): Executable {
  const defaultExecutable = process.platform === 'win32' ? 'sg.exe' : 'sg'
  const command =
    workspace.getConfiguration('astGrep').get<string>('serverPath') ||
    defaultExecutable
  return {
    command,
    args: ['lsp'],
    options: {
      env: {
        ...process.env,
        ...(isDebug ? { RUST_LOG: 'debug' } : {})
      }
    }
  }
}

function activateLsp() {
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

export function activate(_context: ExtensionContext) {
  activateLsp()
}

workspace.onDidChangeConfiguration(changeEvent => {
  if (changeEvent.affectsConfiguration('astGrep')) {
    deactivate()
    activateLsp()
  }
})

export function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
