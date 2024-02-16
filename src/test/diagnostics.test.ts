import * as vscode from 'vscode'

import { getDocUri, testDiagnostics, toRange, testAndRetry } from './utils'

suite('Should get diagnostics', () => {
  const docUri = getDocUri('test.ts')
  testAndRetry('Get ast-grep issues', async () => {
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
