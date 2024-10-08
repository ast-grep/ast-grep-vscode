import * as vscode from 'vscode'

import { getDocUri, sleep, testDiagnostics, testAndRetry } from './utils'
import { EXPECTED_NON_EMPTY_DIAGNOSTICS } from './diagnostics.test'

suite('ast-grep.restartLanguageServer should work', () => {
  const docUri = getDocUri('test.ts')
  const sgConfigYml = getDocUri('sgconfig.yml')
  const tempSgConfigYml = getDocUri('_sgconfig.yml')

  testAndRetry('Delete or create the sgconfig.yml', async () => {
    // remove configFile should receive no diagnostics
    await vscode.workspace.fs.rename(sgConfigYml, tempSgConfigYml)
    await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
    await sleep(1000)
    await testDiagnostics(docUri, [])

    // should receive diagnostics after add configFile
    await vscode.workspace.fs.rename(tempSgConfigYml, sgConfigYml)
    await vscode.commands.executeCommand('ast-grep.restartLanguageServer')
    await sleep(1000)
    await testDiagnostics(docUri, EXPECTED_NON_EMPTY_DIAGNOSTICS)
  })
})
