import type { SgSearch, ChildPort, Definition } from '../../types'
import { Unport } from 'unport'

// @ts-ignore
if (!window.vscode) {
  // @ts-ignore
  window.vscode = acquireVsCodeApi()
}
// @ts-ignore
let vscode = window.vscode

const childPort: ChildPort = new Unport()

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

const resolveMap = new Map<string, (val: any | PromiseLike<any>) => void>()

export function postSearch(inputValue: string) {
  let id = Math.random().toString() // TODO: nanoid
  childPort.postMessage('search', { id, inputValue })
  return new Promise<SgSearch[]>(resolve => {
    resolveMap.set(id, resolve)
  })
}

childPort.onMessage('search', event => {
  const { id, searchResult } = event
  resolveMap.get(id)?.(searchResult)
  resolveMap.delete(id)
})

export const openFile = (data: Definition['child2parent']['openFile']) => {
  childPort.postMessage('openFile', data)
}
