import * as vscode from 'vscode'
import { testAndRetry, sleep } from './utils'

/** Tests for LSP restart functionality with config paths */
suite('Should restart language server', () => {
  testAndRetry('Restart language server with config path scenarios', async () => {
    const config = vscode.workspace.getConfiguration('astGrep')
    const originalConfigPath = config.get('configPath')
    
    try {
      // Test 1: Restart with default config
      console.log('Testing restart with default config...')
      await config.update('configPath', undefined, vscode.ConfigurationTarget.Workspace)
      await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
      await sleep(1500)
      console.log('Default config restart completed')
      
      // Test 2: Restart with custom config path
      console.log('Testing restart with custom config...')
      const customConfigPath = 'sgconfig.yml'
      await config.update('configPath', customConfigPath, vscode.ConfigurationTarget.Workspace)
      
      // Verify the setting was applied
      const updatedConfigPath = config.get('configPath')
      console.log(`Config path set to: ${updatedConfigPath}`)
      
      await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
      await sleep(1500)
      
      // Test 3: Verify config path is preserved after restart
      const configPathAfterRestart = config.get('configPath')
      console.log(`Config path after restart: ${configPathAfterRestart}`)
      
      if (configPathAfterRestart !== customConfigPath) {
        throw new Error(`Config path changed during restart: expected ${customConfigPath}, got ${configPathAfterRestart}`)
      }
      
      console.log('All restart scenarios completed successfully')
    } finally {
      // Restore original config
      await config.update('configPath', originalConfigPath, vscode.ConfigurationTarget.Workspace)
      // Give a moment for the config change to settle
      await sleep(500)
    }
  })
})
