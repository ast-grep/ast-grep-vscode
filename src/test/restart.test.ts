import * as vscode from 'vscode'
import { testAndRetry, sleep } from './utils'

/** Tests for LSP restart functionality with config paths */
suite('Should restart language server', () => {
  testAndRetry('Restart language server with default config', async () => {
    // Clear any existing config path setting to ensure default behavior
    const config = vscode.workspace.getConfiguration('astGrep')
    const originalConfigPath = config.get('configPath')
    await config.update('configPath', undefined, vscode.ConfigurationTarget.Workspace)
    
    try {
      // Execute restart command
      await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
      
      // Allow time for restart to complete
      await sleep(2000)
      
      // Verify command executed without errors
      // The restart should use default sgconfig.yml from workspace root
      const currentConfigPath = config.get('configPath')
      console.log(`Restart with default config completed, configPath: ${currentConfigPath}`)
    } finally {
      // Restore original config
      await config.update('configPath', originalConfigPath, vscode.ConfigurationTarget.Workspace)
    }
  })

  testAndRetry('Restart language server with custom config path', async () => {
    const config = vscode.workspace.getConfiguration('astGrep')
    const originalConfigPath = config.get('configPath')
    const customConfigPath = 'sgconfig.yml' // Use existing config file
    
    try {
      // Set custom config path
      await config.update('configPath', customConfigPath, vscode.ConfigurationTarget.Workspace)
      
      // Verify the setting was applied
      const updatedConfigPath = config.get('configPath')
      console.log(`Config path set to: ${updatedConfigPath}`)
      
      // Execute restart command
      await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
      
      // Allow time for restart to complete
      await sleep(2000)
      
      // Verify the restart command executed
      // The restart should respect the custom config path setting
      console.log('Restart with custom config path completed')
    } finally {
      // Clean up - restore original config
      await config.update('configPath', originalConfigPath, vscode.ConfigurationTarget.Workspace)
    }
  })

  testAndRetry('Restart language server preserves config path setting', async () => {
    const config = vscode.workspace.getConfiguration('astGrep')
    const originalConfigPath = config.get('configPath')
    const testConfigPath = 'sgconfig.yml'
    
    try {
      // Set a specific config path
      await config.update('configPath', testConfigPath, vscode.ConfigurationTarget.Workspace)
      
      // Execute restart command
      await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
      
      // Allow time for restart to complete
      await sleep(2000)
      
      // Verify the config path setting is preserved after restart
      const configPathAfterRestart = config.get('configPath')
      console.log(`Config path after restart: ${configPathAfterRestart}`)
      
      // The config path should remain the same after restart
      if (configPathAfterRestart !== testConfigPath) {
        throw new Error(`Config path changed during restart: expected ${testConfigPath}, got ${configPathAfterRestart}`)
      }
    } finally {
      // Restore original config
      await config.update('configPath', originalConfigPath, vscode.ConfigurationTarget.Workspace)
    }
  })
})