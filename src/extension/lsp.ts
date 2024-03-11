import { workspace, type ExtensionContext, window, commands, Uri } from 'vscode'
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  type Executable,
} from 'vscode-languageclient/node'
import { resolveBinary } from './common'
import { execFile } from 'node:child_process'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

function getExecutable(isDebug: boolean): Executable {
  const command = resolveBinary()
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

async function testBinaryExist() {
  const command = resolveBinary()
  return new Promise(r => {
    execFile(
      command,
      ['-h'],
      {
        // for windows
        shell: true,
      },
      err => {
        r(!err)
      },
    )
  })
}

async function fileExists(pathFromRoot: string): Promise<boolean> {
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders) {
    return false
  }
  const uri = Uri.joinPath(workspaceFolders[0].uri, pathFromRoot)
  try {
    await workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

/**
 * Set up language server/client
 */
export async function activateLsp(context: ExtensionContext) {
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

  if (!(await testBinaryExist())) {
    window
      .showErrorMessage(
        'ast-grep cannot be started. Make sure it is installed.',
        'See doc',
      )
      .then(() => {
        commands.executeCommand(
          'vscode.open',
          Uri.parse(
            'https://ast-grep.github.io/guide/quick-start.html#installation',
          ),
        )
      })
    return
  }

  // instantiate and set input which updates the view
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: getExecutable(false),
    debug: getExecutable(true),
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    diagnosticCollectionName,
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: '*' }],
    outputChannelName,
  }

  // Create the language client and start the client.
  client = new LanguageClient(
    languageClientId,
    languageClientName,
    serverOptions,
    clientOptions,
  )

  // Automatically start the client only if we can find a config file
  if (await fileExists('sgconfig.yml')) {
    // Start the client. This will also launch the server
    client.start()
  }
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
