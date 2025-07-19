import { Unport } from 'unport'
import type { ChildPort, ChildToParent } from '../types'
export type { DisplayResult, RangeInfo } from '../types'
export type OpenPayload = ChildToParent['openFile']

// @ts-expect-error
const vscode = acquireVsCodeApi()

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

export function dismissDiff(data: ChildToParent['dismissDiff']) {
  childPort.postMessage('dismissDiff', data)
}

export function commitChange(diff: ChildToParent['commitChange']) {
  childPort.postMessage('commitChange', diff)
}

export function replaceAll(payload: ChildToParent['replaceAll']) {
  childPort.postMessage('replaceAll', payload)
}
