import * as vscode from 'vscode'
import * as assert from 'assert'

import { getDocUri, activate } from './helper'

suite('Should get diagnostics', () => {
  const docUri = getDocUri('test.ts')
  test('Get ast-grep issues', async () => {
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

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar)
  const end = new vscode.Position(eLine, eChar)
  return new vscode.Range(start, end)
}

async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[]
) {
  await activate(docUri)

  const actualDiagnostics = vscode.languages.getDiagnostics(docUri)

  assert.equal(actualDiagnostics.length, expectedDiagnostics.length)

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i]
    assert.equal(actualDiagnostic.message, expectedDiagnostic.message)
    assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range)
    assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity)
  })
}
