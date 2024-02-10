import * as vscode from 'vscode'

import { getDocUri, sleep, testDiagnostics, toRange } from './utils'

suite('ast-grep.restartLanguageServer should work', () => {
  const docUri = getDocUri('test.ts')
  const sgConfigYml = getDocUri('sgconfig.yml')
  const tempSgConfigYml = getDocUri('_sgconfig.yml')

  test('Delete or create the sgconfig.yml', async () => {
    // remove configFile should receive no diagnostics
    await vscode.workspace.fs.rename(sgConfigYml, tempSgConfigYml)
    await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
    await sleep(2000)
    await testDiagnostics(docUri, [])

    // should receive diagnostics after add configFile
    await vscode.workspace.fs.rename(tempSgConfigYml, sgConfigYml)
    await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
    await sleep(2000)
    await testDiagnostics(docUri, [
      {
        message: 'No console.log',
        range: toRange(2, 4, 2, 32),
        severity: vscode.DiagnosticSeverity.Warning,
        source: 'ex'
      },
      {
        message: 'Test rule for vscode extension',
        range: toRange(0, 0, 4, 1),
        severity: vscode.DiagnosticSeverity.Error,
        source: 'ex'
      },
      {
        message: 'Test rule for vscode extension',
        range: toRange(6, 0, 10, 1),
        severity: vscode.DiagnosticSeverity.Error,
        source: 'ex'
      }
    ])
  })
})
