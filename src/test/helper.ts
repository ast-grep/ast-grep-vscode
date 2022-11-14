import * as vscode from 'vscode'
import * as path from 'path'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor
export let documentEol: string
export let platformEol: string

const fixtureFolderUri = vscode.Uri.file(
  path.resolve(__dirname, '../../fixture')
)
/**
 * Activates the vscode.lsp-sample extension
 */
export async function activate(docUri: vscode.Uri) {
  // The extensionId is `publisher.name` from package.json
  const ext = vscode.extensions.getExtension('ast-grep.ast-grep-vscode')!
  await ext.activate()
  try {
    // open ast-grep project to locate sgconfig.yml
    await vscode.commands.executeCommand('vscode.openFolder', fixtureFolderUri)
    doc = await vscode.workspace.openTextDocument(docUri)
    editor = await vscode.window.showTextDocument(doc)
    // enforce unix line endings, otherwise tests fail on windows
    editor.edit(builder => {
      builder.setEndOfLine(vscode.EndOfLine.LF)
    })
    await sleep(2000) // Wait for server activation
  } catch (e) {
    console.error(e)
  }
}

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
