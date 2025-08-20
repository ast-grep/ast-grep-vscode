import * as vscode from 'vscode'
import { parentPort } from './common'

export function activateCodeLens(context: vscode.ExtensionContext) {
  // Register the CodeLens provider for YAML files
  const codelensProvider = new CodelensProvider()
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: 'yaml', pattern: '**/*.yml' }, // Only trigger for YAML files
      codelensProvider,
    ),
  )

  // Register the command that the CodeLens will execute
  const runRuleCommand = vscode.commands.registerCommand(
    'ast-grep.runRule',
    (ruleId: string, text: string) => {
      parentPort.postMessage('searchByYAML', {
        text,
      })
    },
  )

  context.subscriptions.push(runRuleCommand)
}

class CodelensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = []
    const text = document.getText()

    // Look for rule definitions in YAML files (sgconfig.yml)
    const ruleMatches = text.matchAll(/^(\s*)id:\s*(.+)$/gm)

    for (const match of ruleMatches) {
      const ruleId = match[2].trim()
      const line = document.positionAt(match.index!).line
      const range = new vscode.Range(line, 0, line, 0)

      const command: vscode.Command = {
        title: `Run rule: ${ruleId}`,
        command: 'ast-grep.runRule',
        arguments: [ruleId, text],
      }

      codeLenses.push(new vscode.CodeLens(range, command))
    }

    return codeLenses
  }

  resolveCodeLens(codeLens: vscode.CodeLens, _token: vscode.CancellationToken): vscode.CodeLens {
    return codeLens
  }
}
