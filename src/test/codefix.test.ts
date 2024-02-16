import * as vscode from 'vscode'
import {
  assertCodeActionArraysEqual,
  getExpectedCodeActions,
  getActualCodeActions,
  getDocUri,
  testAndRetry
} from './utils'

/** Actual tests */
suite('Should get code action', () => {
  testAndRetry('Provide code action suggestions', async () => {
    /* Calculate expected code actions */
    const docUri = getDocUri('test.ts')
    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(4, 1)
    )
    const newText = `const AstGrepTest = {
  test() {
    console.log('Hello, world!')
  }
}
`
    let expectedCodeActions = await getExpectedCodeActions(
      docUri,
      range,
      newText
    )
    /* Measure actual code actions */
    let actualCodeActions = await getActualCodeActions(docUri, range)
    assertCodeActionArraysEqual(expectedCodeActions, actualCodeActions, docUri)
  })
})
