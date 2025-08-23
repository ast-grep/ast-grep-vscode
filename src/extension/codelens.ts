import * as vscode from 'vscode'
import { parentPort } from './common'

export function activateCodeLens(context: vscode.ExtensionContext) {
  // Register the CodeLens provider for YAML files
  const codelensProvider = new CodelensProvider()
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: 'yaml' }, // Only trigger for YAML files
      codelensProvider,
    ),
  )

  // Register the command that the CodeLens will execute
  const runRuleCommand = vscode.commands.registerCommand(
    'ast-grep.runRule',
    (text: string) => {
      parentPort.postMessage('searchByYAML', {
        text,
      })
      vscode.commands.executeCommand('ast-grep.search.input.focus')
    },
  )

  context.subscriptions.push(runRuleCommand)
}

class CodelensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const text = document.getText()

    // Look for rule definitions in YAML files
    const isAstGrepRule = /^rule:/m.test(text) && /^id:/m.test(text) && /^language:/m.test(text)
    if (!isAstGrepRule) {
      return []
    }

    const range = new vscode.Range(0, 0, 0, 0)
    const command: vscode.Command = {
      title: `Run ast-grep rule`,
      command: 'ast-grep.runRule',
      arguments: [text],
    }
    return [new vscode.CodeLens(range, command)]
  }

  resolveCodeLens(codeLens: vscode.CodeLens, _token: vscode.CancellationToken): vscode.CodeLens {
    return codeLens
  }
}
