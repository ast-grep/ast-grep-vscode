import type { ExtensionContext } from 'vscode'
import { detectDefaultBinaryAtStart } from './common'
import { activatePreview } from './preview'
import { activateWebview } from './webview'
import { activateLsp } from './lsp'
import { activateSearch } from './search'

export async function activate(context: ExtensionContext) {
  await detectDefaultBinaryAtStart()
  activateLsp(context)
  activateWebview(context)
  activateSearch(context)
  activatePreview(context)
}
