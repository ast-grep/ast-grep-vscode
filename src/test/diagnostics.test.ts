import * as vscode from 'vscode'

import { getDocUri, testAndRetry, testDiagnostics, toRange } from './utils'

export const EXPECTED_NON_EMPTY_DIAGNOSTICS = [
  {
    message: 'No console.log',
    range: toRange(2, 4, 2, 32),
    severity: vscode.DiagnosticSeverity.Warning,
    source: 'ast-grep',
    code: 'no-console-log',
  },
  {
    message: 'Test rule for vscode extension',
    range: toRange(0, 0, 4, 1),
    severity: vscode.DiagnosticSeverity.Error,
    source: 'ast-grep',
    code: 'test-sg-rule',
  },
  {
    message: 'Test rule for vscode extension',
    range: toRange(6, 0, 10, 1),
    severity: vscode.DiagnosticSeverity.Error,
    source: 'ast-grep',
    code: 'test-sg-rule',
  },
]

suite('Should get diagnostics', () => {
  const docUri = getDocUri('test.ts')
  testAndRetry('Get ast-grep issues', async () => {
    await testDiagnostics(docUri, EXPECTED_NON_EMPTY_DIAGNOSTICS)
  })
})
