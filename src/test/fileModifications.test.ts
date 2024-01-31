import * as vscode from 'vscode'
import * as yaml from 'js-yaml'

import {
  getDocUri,
  activate,
  waitForDiagnosticChange,
  assertDiagnosticsEqual
} from './utils'

const TOO_LONG_TO_WAIT_FOR_UPDATE_AFTER_FILE_CHANGE = 5000 // ms

const docUri = getDocUri('test.ts')
const diagnosticss = getExpectedDiagnosticss()

async function writeNewRule() {
  let vscodeuri = vscode.Uri.file(
    vscode.workspace.workspaceFolders![0].uri.fsPath +
      '/rules/no-math-random.yml'
  )
  await vscode.workspace.fs.writeFile(
    vscodeuri,
    new Uint8Array(
      Buffer.from(`id: no-math-random
message: No Math.random
severity: warning
language: TypeScript
rule:
  pattern: Math.random($$$)
note: no Math.random()`)
    )
  )
}
async function deleteNewRule() {
  let vscodeuri = vscode.Uri.file(
    vscode.workspace.workspaceFolders![0].uri.fsPath +
      '/rules/no-math-random.yml'
  )
  await vscode.workspace.fs.delete(vscodeuri)
}
async function setRuleDirs(newRuleDirs: string[]) {
  let vscodeuri = vscode.Uri.file(
    vscode.workspace.workspaceFolders![0].uri.fsPath + '/sgconfig.yml'
  )
  let content = await vscode.workspace.fs.readFile(vscodeuri)
  let configText = new TextDecoder().decode(content)
  let configObj = yaml.load(configText) as { ruleDirs: string[] }
  configObj.ruleDirs = newRuleDirs
  await vscode.workspace.fs.writeFile(
    vscodeuri,
    new Uint8Array(Buffer.from(yaml.dump(configObj)))
  )
}

suite('Should update when files change', () => {
  test('Update on new rule creation', async () => {
    assertDiagnosticsEqual(
      vscode.languages.getDiagnostics(docUri),
      diagnosticss[0]
    )
    writeNewRule()
    await waitForDiagnosticChange(TOO_LONG_TO_WAIT_FOR_UPDATE_AFTER_FILE_CHANGE)
    assertDiagnosticsEqual(
      vscode.languages.getDiagnostics(docUri),
      diagnosticss[1]
    )
  })
  test('Update on rule deletion', async () => {
    deleteNewRule()
    await waitForDiagnosticChange(TOO_LONG_TO_WAIT_FOR_UPDATE_AFTER_FILE_CHANGE)
    assertDiagnosticsEqual(
      vscode.languages.getDiagnostics(docUri),
      diagnosticss[2]
    )
  })
  test('Update on ruleDirs change to nonexistent path', async () => {
    await setRuleDirs(['NoRules'])
    await waitForDiagnosticChange(TOO_LONG_TO_WAIT_FOR_UPDATE_AFTER_FILE_CHANGE)
    assertDiagnosticsEqual(vscode.languages.getDiagnostics(docUri), [])
  })
  test('Update on ruleDirs change back to real path', async () => {
    await setRuleDirs(['rules'])
    await waitForDiagnosticChange(TOO_LONG_TO_WAIT_FOR_UPDATE_AFTER_FILE_CHANGE)
    assertDiagnosticsEqual(
      vscode.languages.getDiagnostics(docUri),
      diagnosticss[0]
    )
  })
})

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar)
  const end = new vscode.Position(eLine, eChar)
  return new vscode.Range(start, end)
}

function getExpectedDiagnosticss() {
  const full = [
    {
      message: 'No Math.random',
      range: toRange(14, 8, 14, 21),
      severity: vscode.DiagnosticSeverity.Warning,
      source: 'ex'
    },
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
  ]

  return [
    [full[1], full[2], full[3]],
    [full[0], full[1], full[2], full[3]],
    [full[1], full[2], full[3]]
  ]
}
