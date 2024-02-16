import * as vscode from 'vscode'
import * as path from 'path'
import * as assert from 'assert'
import * as retry from 'ts-retry'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor

/**
 * Prepare the vscode environment for testing by opening the fixture folder
 * and activating the extension.
 *
 * This function must be called before any tests are run.
 * And it should only be called once
 */
export async function activate() {
  // The extensionId is `publisher.name` from package.json
  const ext = vscode.extensions.getExtension('ast-grep.ast-grep-vscode')!
  const fixtureFolderUri = vscode.Uri.file(
    path.resolve(__dirname, '../../fixture')
  )
  await ext.activate()
  try {
    // open ast-grep project to locate sgconfig.yml
    await vscode.commands.executeCommand('vscode.openFolder', fixtureFolderUri)
    doc = await vscode.workspace.openTextDocument(getDocUri('test.ts'))
    editor = await vscode.window.showTextDocument(doc)
    // enforce unix line endings, otherwise tests fail on windows
    await editor.edit(builder => {
      builder.setEndOfLine(vscode.EndOfLine.LF)
    })
    await sleep(1500) // Wait for server activation
  } catch (e) {
    console.error(e)
  }
}

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

// Add this function to normalize line endings
function eolReplacer(key: string, value: any) {
  if (typeof value === 'string') {
    return value.replace(/\r\n/g, '\n')
  }
  return value
}

export function assertCodeActionArraysEqual(
  codeActions1: vscode.CodeAction[],
  codeActions2: vscode.CodeAction[],
  docUri: vscode.Uri
): void {
  assert.equal(codeActions1.length, codeActions2.length)
  codeActions1.forEach((codeAction1, i) => {
    const codeAction2 = codeActions2[i]
    assertCodeActionsEqual(codeAction1, codeAction2, docUri)
  })
}
export function assertCodeActionsEqual(
  codeAction1: vscode.CodeAction,
  codeAction2: vscode.CodeAction,
  docUri: vscode.Uri
): void {
  if (codeAction1.title !== codeAction2.title) {
    throw new Error(
      `Code Action Title: ${codeAction1.title} !== ${codeAction2.title}`
    )
  }

  if (codeAction1.isPreferred !== codeAction2.isPreferred) {
    throw new Error(
      `Code Action isPreferred: ${codeAction1.isPreferred} !== ${codeAction2.isPreferred}`
    )
  }

  if (codeAction1.edit === undefined && codeAction2.edit === undefined) {
    return // both are undefined which counts as equal
  }
  if (codeAction1.edit === undefined) {
    throw new Error(
      `The First Code Action's edit is undefined, but the second is ${codeAction2.edit}`
    )
  }
  if (codeAction2.edit === undefined) {
    throw new Error(
      `The First Code Action's edit is ${codeAction1.edit}, but the second is undefined`
    )
  }
  // both exist
  let edits1 = codeAction1.edit!.get(docUri)
  let edits2 = codeAction2.edit!.get(docUri)
  edits1.forEach((_, i) => {
    let text1 = JSON.stringify(edits1[i], eolReplacer, 2)
    let text2 = JSON.stringify(edits2[i], eolReplacer, 2)
    if (text1 !== text2) {
      throw new Error(
        `Code Action Edit #${i} mismatch:\n${text1}\n!==\n${text2}`
      )
    }
  })
}

export async function getActualCodeActions(
  docUri: vscode.Uri,
  range: vscode.Range
): Promise<vscode.CodeAction[]> {
  try {
    let executedCommand = await vscode.commands.executeCommand(
      'vscode.executeCodeActionProvider',
      docUri,
      range,
      'quickfix'
    )
    return executedCommand as vscode.CodeAction[]
  } catch (e) {
    console.error('Failed to get code actions.')
    throw e
  }
}
export function getExpectedCodeActions(
  docUri: vscode.Uri,
  range: vscode.Range,
  newText: string
): vscode.CodeAction[] {
  const edit = new vscode.WorkspaceEdit()
  edit.replace(docUri, range, newText)
  let exp = [
    {
      title: 'Test rule for vscode extension',
      kind: vscode.CodeActionKind.QuickFix,
      edit,
      isPreferred: true
    }
  ] as vscode.CodeAction[]
  return exp
}

/**
 * Helper function to make our mocha tests retry on failure
 */
const defaultRetryOptions: retry.RetryOptions = {
  delay: 1000,
  maxTry: 4
  // onError: (e: Error) => console.log(`Test failed but retrying after 1s`)
}
export function testAndRetry(
  name: string,
  fn: () => Promise<void>,
  retryOptions?: retry.RetryOptions
) {
  let startTime = Date.now()
  let firstTry = true
  let elapsedTime = 0
  let errors: Error[] = []
  let wrapped = async () => {
    try {
      if (!firstTry) {
        elapsedTime = Date.now() - startTime
        console.log(`Retrying test at t=${elapsedTime}ms`)
      } else {
        firstTry = false
      }
      await fn()
    } catch (e) {
      if (e instanceof Error) {
        errors.push(e)
        throw e
      }
    }
  }
  let options = Object.assign({}, defaultRetryOptions, retryOptions)
  return test(name, async () => {
    let p = retry.retry(wrapped, options)
    p.finally(() => {
      errors.forEach((error, index) => {
        console.error(`Error ${index + 1}: ${error.toString()}`)
        // console.error(`Stack trace: ${error.stack}`)
      })
      if (errors.length > 0) {
        throw errors[errors.length - 1]
      }
    })
    await p
  })
}
