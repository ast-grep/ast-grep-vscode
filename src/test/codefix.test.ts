import * as vscode from 'vscode'
import {
  assertCodeActionArraysEqual,
  getActualCodeActions,
  getDocUri,
  testAndRetry,
} from './utils'

/** Actual tests */
suite('Should get code action', () => {
  testAndRetry('Provide code action suggestions', async () => {
    const docUri = getDocUri('test.ts')
    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(4, 1),
    )
    /* Generate expected code actions */
    const expectedTitle = 'Fix `test-sg-rule` with ast-grep'
    const expectedKind = vscode.CodeActionKind.QuickFix
    const expectedIsPreferred = true
    const expectedNewText = `const AstGrepTest = {
  test() {
    console.log('Hello, world!')
  }
}
`
    const edit = new vscode.WorkspaceEdit()
    edit.replace(docUri, range, expectedNewText)
    const expectedCodeActions = [
      {
        title: expectedTitle,
        kind: expectedKind,
        edit: edit,
        isPreferred: expectedIsPreferred,
      } as vscode.CodeAction,
    ]

    /* Measure actual code actions */
    const actualCodeActions = await getActualCodeActions(docUri, range)
    /* Compare them */
    assertCodeActionArraysEqual(actualCodeActions, expectedCodeActions, docUri)
  })
})
