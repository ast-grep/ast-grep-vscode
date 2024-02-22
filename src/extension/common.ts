import type { ParentPort } from '../types'
import { Unport } from 'unport'
import { workspace } from 'vscode'

export function resolveBinary() {
  return workspace.getConfiguration('astGrep').get('serverPath', 'ast-grep')
}

export const parentPort: ParentPort = new Unport()
