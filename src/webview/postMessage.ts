import type { ChildPort, ChildToParent } from '../types'
import { Unport } from 'unport'
export type { DisplayResult } from '../types'
export type OpenPayload = ChildToParent['openFile']

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

export function previewDiff(data: ChildToParent['previewDiff']) {
  childPort.postMessage('previewDiff', data)
}
