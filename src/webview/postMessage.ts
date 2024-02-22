import type { ChildPort, Definition } from '../types'
import { Unport } from 'unport'
export type { DisplayResult } from '../types'
export type OpenPayload = Definition['child2parent']['openFile']

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
  },
})

export const openFile = (data: OpenPayload) => {
  childPort.postMessage('openFile', data)
}

export function previewDiff(data: Definition['child2parent']['previewDiff']) {
  childPort.postMessage('previewDiff', data)
}
