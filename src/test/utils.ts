import * as vscode from 'vscode'
import * as path from 'node:path'
import * as assert from 'node:assert'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor

/**
 * Compare actual and expected diagnostics reported by the language server
 * sort them so that order doesn't matter
 */
export const assertDiagnosticsEqual = (
  actual: vscode.Diagnostic[],
  expected: vscode.Diagnostic[],
) => {
  assert.equal(actual.length, expected.length)
  actual.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1,
  )
  expected.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1,
  )
  actual.forEach((actualElement, i) => {
    assert.equal(actualElement.message, expected[i].message)
    assert.deepEqual(actualElement.range, expected[i].range)
    assert.equal(actualElement.severity, expected[i].severity)
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
    doc.positionAt(doc.getText().length),
  )
  return editor.edit(eb => eb.replace(all, content))
}

export async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[],
) {
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri)
  actualDiagnostics.sort((a, b) =>
    a.message === b.message ? 0 : a.message > b.message ? 1 : -1,
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
  eChar: number,
) {
  const start = new vscode.Position(sLine, sChar)
  const end = new vscode.Position(eLine, eChar)
  return new vscode.Range(start, end)
}

/**
 * Compare actual and expected arrays of code actions reported by the language server
 * @param actual array of vscode.CodeAction objects
 * @param expected array of vscode.CodeAction objects
 * @param docUri The URI of the document being tested
 */
export function assertCodeActionArraysEqual(
  actuals: vscode.CodeAction[],
  expecteds: vscode.CodeAction[],
  docUri: vscode.Uri,
): void {
  assert.equal(actuals.length, expecteds.length, 'Number of CodeActions differ')
  expecteds.forEach((_, i) => {
    const actual = actuals[i]
    const expected = expecteds[i]
    assert.equal(actual.title, expected.title, 'title')
    assert.equal(actual.isPreferred, expected.isPreferred, 'isPreferred')
    // needed for windows
    assert.equal(
      JSON.stringify(actual.edit?.get(docUri), str =>
        str.replace(/\r\n/g, '\n'),
      ),
      JSON.stringify(expected.edit?.get(docUri), str =>
        str.replace(/\r\n/g, '\n'),
      ),
      "CodeActions' edit texts differ",
    )
  })
}

/**
 * Get the actual code actions reported by the language server
 * @throws Error if the call to vscode.commands.executeCommand fails
 */
export async function getActualCodeActions(
  docUri: vscode.Uri,
  range: vscode.Range,
): Promise<vscode.CodeAction[]> {
  try {
    const executedCommand = await vscode.commands.executeCommand(
      'vscode.executeCodeActionProvider',
      docUri,
      range,
      'quickfix',
    )
    return executedCommand as vscode.CodeAction[]
  } catch (e) {
    console.error('Failed to get code actions.')
    throw e
  }
}

const MAX_RETRIES = 3
/**
 * Helper function to make our mocha tests retry on failure
 */
export function testAndRetry(name: string, fn: () => Promise<void>) {
  return test(name, async () => {
    const errors: Array<unknown> = []
    const startTime = Date.now()
    /* perform retries */
    let retries = 0
    while (true) {
      try {
        await fn()
        break
      } catch (e) {
        errors.push(e)
        if (++retries < MAX_RETRIES) {
          await sleep(1000)
          console.log(`Retrying test at t = ${Date.now() - startTime}ms`)
        }
      }
    }
    /* Log every error that ocurred */
    errors.forEach((error, index) => {
      console.error(`Error ${index + 1}: ${error}`)
    })
    /* Throw the last error if all retries have been exhausted */
    if (retries >= MAX_RETRIES) {
      throw errors[errors.length - 1]
    }
  })
}
