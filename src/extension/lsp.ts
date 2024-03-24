import { workspace, type ExtensionContext, window, commands, Uri } from 'vscode'
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  type Executable,
} from 'vscode-languageclient/node'
import { resolveBinary, testBinaryExist } from './common'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

function getExecutable(
  config: string | undefined,
  isDebug: boolean,
): Executable {
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  const command = resolveBinary()
  const args = config ? ['lsp', '-c', config] : ['lsp']
  return {
    command,
    args,
    options: {
      env: {
        ...process.env,
        ...(isDebug ? { RUST_LOG: 'debug' } : {}),
      },
      // shell is required for Windows cmd to pick up global npm binary
      shell: process.platform === 'win32',
      cwd: uris[0],
    },
  }
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

/** returns the path to the config file if found
   note: if the default sgconfig.yml is found, return ''
   returns undefined if no config file is found
   so you should not use Boolean to check the result
*/
async function findConfigFile(): Promise<string | undefined> {
  const userConfig = workspace.getConfiguration('astGrep').get('configPath', '')
  if (userConfig) {
    if (await fileExists(userConfig)) {
      return userConfig
    }
  } else if (
    (await fileExists('sgconfig.yml')) ||
    (await fileExists('sgconfig.yaml'))
  ) {
    return ''
  }
  return undefined
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

  if (!(await testBinaryExist(resolveBinary()))) {
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

  const setupOkay = await setupClient()

  // Automatically start the client only if we can find a config file
  if (setupOkay) {
    // Start the client. This will also launch the server
    client.start()
  } else {
    client.outputChannel.appendLine(
      'no project file sgconfig.yml found in root. Skip starting LSP.',
    )
  }
}

async function setupClient() {
  const configFile = await findConfigFile()
  // instantiate and set input which updates the view
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: getExecutable(configFile, false),
    debug: getExecutable(configFile, true),
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
  return configFile !== undefined
}

async function restart(): Promise<void> {
  await deactivate()
  if (client) {
    await setupClient()
    await client.start()
  }
}

function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
