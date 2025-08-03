import { commands, env, type ExtensionContext, type FileSystemWatcher, type RelativePattern, Uri, window, workspace } from 'vscode'
import {
  type Executable,
  ExecuteCommandRequest,
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
} from 'vscode-languageclient/node'
import { resolveBinary, testBinaryExist } from './common'

let client: LanguageClient
const diagnosticCollectionName = 'ast-grep-diagnostics'
const outputChannelName = 'ast-grep'
const languageClientId = 'ast-grep-client'
const languageClientName = 'ast-grep language client'

// File watchers for auto-refresh functionality
let configFileWatcher: FileSystemWatcher | undefined
let ruleDirectoryWatchers: FileSystemWatcher[] = []

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

async function applyAllFixes() {
  const textEditor = window.activeTextEditor
  if (!textEditor) {
    return
  }
  if (!client) {
    return
  }
  const textDocument = {
    uri: textEditor.document.uri.toString(),
    version: textEditor.document.version,
    text: textEditor.document.getText(),
    languageId: textEditor.document.languageId,
  }
  const params = {
    command: 'ast-grep.applyAllFixes',
    arguments: [textDocument],
  }
  client.sendRequest(ExecuteCommandRequest.type, params).then(undefined, () => {
    const actionButtonName = 'See Doc'
    window
      .showErrorMessage(
        'Failed to apply ast-grep fixes to the document. Please consider upgrading ast-grep version or opening an issue with steps to reproduce.',
        actionButtonName,
      )
      .then(value => {
        if (value === actionButtonName) {
          env.openExternal(
            Uri.parse(
              'https://ast-grep.github.io/guide/quick-start.html#installation',
            ),
          )
        }
      })
  })
}

interface Found {
  found: boolean
  // empty path means default config file
  path: string
}

/**
 * Parse the sgconfig.yml file to extract rule directories
 */
async function parseConfigForRuleDirs(configPath: string): Promise<string[]> {
  try {
    const workspaceFolders = workspace.workspaceFolders
    if (!workspaceFolders) {
      return []
    }
    
    const configUri = Uri.joinPath(workspaceFolders[0].uri, configPath)
    const configData = await workspace.fs.readFile(configUri)
    const configText = Buffer.from(configData).toString('utf8')
    
    // Simple YAML parsing for ruleDirs
    // Look for ruleDirs: followed by list items
    const ruleDirs: string[] = []
    const lines = configText.split('\n')
    let inRuleDirs = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed === 'ruleDirs:') {
        inRuleDirs = true
        continue
      }
      
      if (inRuleDirs) {
        if (trimmed.startsWith('- ')) {
          // Extract directory name after "- "
          const dir = trimmed.substring(2).trim()
          if (dir) {
            ruleDirs.push(dir)
          }
        } else if (trimmed && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
          // End of ruleDirs section
          break
        }
      }
    }
    
    return ruleDirs
  } catch (error) {
    console.error('Failed to parse config file:', error)
    return []
  }
}

/**
 * Set up file watchers for config file and rule directories
 */
async function setupFileWatchers(configPath: string): Promise<void> {
  // Clean up existing watchers
  cleanupFileWatchers()
  
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders) {
    return
  }
  
  const workspaceRoot = workspaceFolders[0].uri
  
  // Watch the config file
  const configPattern = configPath || '{sgconfig.yml,sgconfig.yaml}'
  const configRelativePattern: RelativePattern = {
    base: workspaceRoot.fsPath,
    baseUri: workspaceRoot,
    pattern: configPattern
  }
  configFileWatcher = workspace.createFileSystemWatcher(configRelativePattern)
  
  configFileWatcher.onDidChange(async () => {
    console.log('Config file changed, restarting ast-grep language server...')
    await restart()
    // Re-setup watchers in case rule directories changed
    // The restart() function will handle re-setup of watchers automatically
  })
  
  configFileWatcher.onDidCreate(async () => {
    console.log('Config file created, restarting ast-grep language server...')
    await restart()
    // The restart() function will handle re-setup of watchers automatically
  })
  
  configFileWatcher.onDidDelete(async () => {
    console.log('Config file deleted, stopping ast-grep language server...')
    await deactivate()
  })
  
  // Parse config to get rule directories and watch them
  const actualConfigPath = configPath || 
    (await fileExists('sgconfig.yml') ? 'sgconfig.yml' : 
     await fileExists('sgconfig.yaml') ? 'sgconfig.yaml' : '')
     
  if (actualConfigPath && await fileExists(actualConfigPath)) {
    const ruleDirs = await parseConfigForRuleDirs(actualConfigPath)
    
    for (const ruleDir of ruleDirs) {
      try {
        // Watch for changes in rule directory (including subdirectories)
        const ruleDirPattern = `${ruleDir}/**/*.{yml,yaml}`
        const ruleRelativePattern: RelativePattern = {
          base: workspaceRoot.fsPath,
          baseUri: workspaceRoot,
          pattern: ruleDirPattern
        }
        const watcher = workspace.createFileSystemWatcher(ruleRelativePattern)
        
        const onRuleChange = async () => {
          console.log(`Rule file changed in ${ruleDir}, restarting ast-grep language server...`)
          await restart()
        }
        
        watcher.onDidChange(onRuleChange)
        watcher.onDidCreate(onRuleChange)
        watcher.onDidDelete(onRuleChange)
        
        ruleDirectoryWatchers.push(watcher)
      } catch (error) {
        console.error(`Failed to setup watcher for rule directory ${ruleDir}:`, error)
      }
    }
  }
}

/**
 * Clean up all file watchers
 */
function cleanupFileWatchers(): void {
  if (configFileWatcher) {
    configFileWatcher.dispose()
    configFileWatcher = undefined
  }
  
  for (const watcher of ruleDirectoryWatchers) {
    watcher.dispose()
  }
  ruleDirectoryWatchers = []
}

/** returns the path to the config file if found */
async function findConfigFile(): Promise<Found> {
  const userConfig = workspace.getConfiguration('astGrep').get('configPath', '')
  let found = false
  if (userConfig) {
    found = await fileExists(userConfig)
  } else {
    found = (await fileExists('sgconfig.yml')) || (await fileExists('sgconfig.yaml'))
  }
  return {
    found,
    path: userConfig || '',
  }
}

/**
 * Set up language server/client
 */
export async function activateLsp(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('ast-grep.executeAutofix', applyAllFixes),
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
      .then(selection => {
        if (selection === 'See doc') {
          commands.executeCommand(
            'vscode.open',
            Uri.parse(
              'https://ast-grep.github.io/guide/tools/editors.html#faqs',
            ),
          )
        }
      })
    return
  }

  const setupOkay = await setupClient()

  // Automatically start the client only if we can find a config file
  if (setupOkay.found) {
    // Start the client. This will also launch the server
    client.start()
    
    // Set up file watchers for auto-refresh
    await setupFileWatchers(setupOkay.path)
  } else {
    const path = setupOkay.path || 'sgconfig.yml'
    client.outputChannel.appendLine(
      `no project file "${path}" found in root. Skip starting LSP.`,
    )
    client.outputChannel.appendLine(
      'See LSP setup guide https://ast-grep.github.io/guide/tools/editors.html#vscode.',
    )
  }

  // Ensure cleanup happens when extension is deactivated
  context.subscriptions.push({
    dispose: cleanupFileWatchers
  })
}

async function setupClient() {
  const configFile = await findConfigFile()
  // instantiate and set input which updates the view
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: getExecutable(configFile.path, false),
    debug: getExecutable(configFile.path, true),
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
  return configFile
}

async function restart(): Promise<void> {
  await deactivate()
  if (client) {
    const setupOkay = await setupClient()
    await client.start()
    
    // Re-setup file watchers after restart
    if (setupOkay.found) {
      await setupFileWatchers(setupOkay.path)
    }
  }
}

function deactivate(): Promise<void> | undefined {
  // Clean up file watchers first
  cleanupFileWatchers()
  
  if (!client) {
    return undefined
  }
  return client.stop()
}
