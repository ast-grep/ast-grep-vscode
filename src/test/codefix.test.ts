import * as vscode from 'vscode'
import * as assert from 'assert'

import { getDocUri, activate } from './utils'

suite('Should get code action', () => {
  const docUri = getDocUri('test.ts')
  test('Provide code action suggestions', async () => {
    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(4, 1)
    )
    const edit = new vscode.WorkspaceEdit()
    edit.replace(
      docUri,
      range,
      `const AstGrepTest = {
  test() {
    console.log('Hello, world!')
  }
}
`
    )
    await testCodeFix(docUri, range, [
      {
        title: 'Test rule for vscode extension',
        kind: vscode.CodeActionKind.QuickFix,
        edit,
        isPreferred: true
      }
    ])
  })
})

async function testCodeFix(
  docUri: vscode.Uri,
  range: vscode.Range,
  expectedCodeActions: vscode.CodeAction[]
) {
  await activate(docUri)

  const actualCodeActions = (await vscode.commands.executeCommand(
    'vscode.executeCodeActionProvider',
    docUri,
    range,
    'quickfix'
  )) as vscode.CodeAction[]

  assert.equal(actualCodeActions.length, expectedCodeActions.length)

  expectedCodeActions.forEach((expectedCodeAction, i) => {
    const actualCodeAction = actualCodeActions[i]
    assert.equal(actualCodeAction.title, expectedCodeAction.title)
    assert.equal(actualCodeAction.isPreferred, expectedCodeAction.isPreferred)
    assert.deepEqual(
      actualCodeAction.edit!.get(docUri),
      expectedCodeAction.edit!.get(docUri)
    )
  })
}
