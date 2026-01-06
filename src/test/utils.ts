import * as assert from 'node:assert'
import * as path from 'node:path'
import * as vscode from 'vscode'

export let editor: vscode.TextEditor

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

export async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[],
) {
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri)
  actualDiagnostics.sort((a, b) => a.message === b.message ? 0 : a.message > b.message ? 1 : -1)

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
      JSON.stringify(actual.edit?.get(docUri), str => str.replace(/\r\n/g, '\n')),
      JSON.stringify(expected.edit?.get(docUri), str => str.replace(/\r\n/g, '\n')),
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
    const executedCommand: vscode.CodeAction[] = await vscode.commands.executeCommand(
      'vscode.executeCodeActionProvider',
      docUri,
      range,
      'quickfix',
    )
    // Filter out any copilot suggestions that may interfere with tests
    return executedCommand.filter(action => !action.kind?.value.includes('copilot'))
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
        } else {
          break
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
