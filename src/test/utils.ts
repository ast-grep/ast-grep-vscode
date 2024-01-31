import * as vscode from 'vscode'
import * as path from 'path'
import * as assert from 'assert'

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
    await sleep(2000) // Wait for server activation
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
 * Generic function that takes a callback-based function and converts it to a Promise-based function
 * It would also be reasonable to import this from a library like util.promisify
 * @param func The callback-based function to be converted (think 'setTimeout')
 * @param optionalTimeout The optional timeout in milliseconds to wait for the callback to be called
 * @param errorText The optional error text to throw if the timeout is reached
 */
const promisify =
  (func: Function, optionalTimeout?: number, errorText: string = 'Timeout') =>
  (...args: any[]) => {
    const mainPromise = new Promise((resolve, _) =>
      func(...args, (result: any) => resolve(result))
    )
    if (optionalTimeout !== undefined) {
      return Promise.race([
        mainPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(errorText)), optionalTimeout)
        )
      ])
    } else {
      return mainPromise
    }
  }

/**
 * Helper function allowing us to wait for a vscode.DiagnosticChangeEvent to be fired
 * This is useful for tests where we modify a file and then want to wait for the diagnostics to be updated
 * @param optionalTimeout The optional timeout in milliseconds to wait for the callback to be called. If no timeout is provided, the function will wait indefinitely.
 *
 */
export const waitForDiagnosticChange = async (optionalTimeout?: number) => {
  let disposable: vscode.Disposable | undefined
  try {
    return await promisify(
      (handler: (e: vscode.DiagnosticChangeEvent) => vscode.Disposable) => {
        disposable = vscode.languages.onDidChangeDiagnostics(handler)
        return disposable
      },
      optionalTimeout,
      'Took too long waiting for diagnostics to change. Limit was set at ' +
        optionalTimeout +
        'ms'
    )()
  } finally {
    if (disposable) {
      disposable.dispose()
    }
  }
}

/**
 * @param ms The number of milliseconds to sleep
 * @returns
 */
async function sleep(ms: number) {
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
