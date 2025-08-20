import type { ExtensionContext } from 'vscode'
import { activateCodeLens } from './codelens'
import { detectDefaultBinaryAtStart } from './common'
import { activateLsp } from './lsp'
import { activatePreview } from './preview'
import { activateSearch } from './search'
import { activateWebview } from './webview'

export async function activate(context: ExtensionContext) {
  await detectDefaultBinaryAtStart()
  activateLsp(context)
  activateWebview(context)
  activateSearch(context)
  activatePreview(context)
  activateCodeLens(context)
}
