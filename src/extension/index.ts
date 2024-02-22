import { ExtensionContext } from 'vscode'
import { registerPreviewProvider } from './replacePreview'
import { activateWebview } from './view'
import { activateLsp } from './lsp'
import { activateSearch } from './search'

export function activate(context: ExtensionContext) {
  registerPreviewProvider(context)
  activateLsp(context)
  activateWebview(context)
  activateSearch(context)
}
