import * as vscode from 'vscode'
import * as path from 'path'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor
export let documentEol: string
export let platformEol: string

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
