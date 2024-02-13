import * as vscode from 'vscode'
import * as path from 'path'
import * as assert from 'assert'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor

/**
 * Compare expected and actual diagnostics reported by the language server
 * sort them so that order doesn't matter
 * @param d1 The first array of vscode.Diagnostic objects
 * @param d2 The second array of vscode.Diagnostic objects
 */
export const assertDiagnosticsEqual = (
  d1: vscode.Diagnostic[],
  d2: vscode.Diagnostic[]
) => {
  assert.equal(d1.length, d2.length)
  d1.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1
  )
  d2.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1
  )
  d1.forEach((d, i) => {
    assert.equal(d.message, d2[i].message)
    assert.deepEqual(d.range, d2[i].range)
    assert.equal(d.severity, d2[i].severity)
  })
}

/**
 * @param ms The number of milliseconds to sleep
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const getDocPath = (p: string) => {
  return path.resolve(__dirname, '../../fixture', p)
}
export const getDocUri = (p: string) => {
  return vscode.Uri.file(getDocPath(p))
}

export async function setTestContent(content: string): Promise<boolean> {
  const all = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length)
  )
  return editor.edit(eb => eb.replace(all, content))
}

export async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[]
) {
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri)
  actualDiagnostics.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1
  )

  assert.equal(actualDiagnostics.length, expectedDiagnostics.length)

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i]
    assert.equal(actualDiagnostic.message, expectedDiagnostic.message)
    assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range)
    assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity)
  })
}

export function toRange(
  sLine: number,
  sChar: number,
  eLine: number,
  eChar: number
) {
  const start = new vscode.Position(sLine, sChar)
  const end = new vscode.Position(eLine, eChar)
  return new vscode.Range(start, end)
}
