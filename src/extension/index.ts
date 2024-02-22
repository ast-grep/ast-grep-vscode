import { ExtensionContext } from 'vscode'
import { activatePreview } from './preview'
import { activateWebview } from './view'
import { activateLsp } from './lsp'
import { activateSearch } from './search'

export function activate(context: ExtensionContext) {
  activateLsp(context)
  activateWebview(context)
  activateSearch(context)
  activatePreview(context)
}
