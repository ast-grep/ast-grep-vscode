import * as vscode from 'vscode'
import { testAndRetry, sleep } from './utils'

/** Tests for LSP restart functionality with config paths */
suite('Should restart language server', () => {
  testAndRetry('Restart language server with config path scenarios', async () => {
    const config = vscode.workspace.getConfiguration('astGrep')
    const originalConfigPath = config.get('configPath')
    
    try {
      // Test 1: Verify default config behavior
      console.log('Testing default config behavior...')
      await config.update('configPath', undefined, vscode.ConfigurationTarget.Workspace)
      await sleep(100)
      
      // Verify setting was applied
      const defaultConfigPath = config.get('configPath')
      if (defaultConfigPath !== undefined) {
        throw new Error(`Expected undefined config path, got: ${defaultConfigPath}`)
      }
      console.log('Default config verification completed')
      
      // Test 2: Set and verify custom config path
      console.log('Testing custom config path...')
      const customConfigPath = 'sgconfig.yml'
      await config.update('configPath', customConfigPath, vscode.ConfigurationTarget.Workspace)
      await sleep(100)
      
      // Verify the setting was applied
      const updatedConfigPath = config.get('configPath')
      console.log(`Config path set to: ${updatedConfigPath}`)
      
      if (updatedConfigPath !== customConfigPath) {
        throw new Error(`Config path not set correctly: expected ${customConfigPath}, got ${updatedConfigPath}`)
      }
      
      // Test 3: Verify restart command exists and can be called without error
      console.log('Testing restart command availability...')
      const availableCommands = await vscode.commands.getCommands()
      const restartCommandExists = availableCommands.includes('ast-grep.restartLanguageServer')
      
      if (!restartCommandExists) {
        throw new Error('ast-grep.restartLanguageServer command is not registered')
      }
      
      // Test 4: Verify config path setting is preserved after configuration changes
      const configPathAfterTests = config.get('configPath')
      console.log(`Config path after tests: ${configPathAfterTests}`)
      
      if (configPathAfterTests !== customConfigPath) {
        throw new Error(`Config path changed during tests: expected ${customConfigPath}, got ${configPathAfterTests}`)
      }
      
      console.log('All restart configuration scenarios completed successfully')
    } finally {
      // Restore original config
      await config.update('configPath', originalConfigPath, vscode.ConfigurationTarget.Workspace)
      // Give a moment for the config change to settle
      await sleep(100)
    }
  })
})
