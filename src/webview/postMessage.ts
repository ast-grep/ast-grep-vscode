import type { ChildPort, Definition } from '../types'
import { Unport } from 'unport'
export type { SgSearch } from '../types'

// @ts-expect-error
let vscode = acquireVsCodeApi()

export const childPort: ChildPort = new Unport()

childPort.implementChannel({
  send(message) {
    vscode.postMessage(message)
  },
  accept(pipe) {
    window.addEventListener('message', ev => {
      pipe(ev.data)
    })
  }
})

export const openFile = (data: Definition['child2parent']['openFile']) => {
  childPort.postMessage('openFile', data)
}
