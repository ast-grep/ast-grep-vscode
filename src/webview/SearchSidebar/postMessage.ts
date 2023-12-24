import type { SgSearch, ChildPort } from '../../types'
import { useCallback, useEffect, useRef } from 'react'
import { Unport } from 'unport'

const vscode =
  // @ts-ignore
  acquireVsCodeApi()
// @ts-ignore
window.vscode = vscode

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

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  window.__reload__ = function () {
    console.log('post message to vscode to reload!')
    childPort.postMessage('reload', {})
  }
}

export const useSgSearch = () => {
  const resolveMap = useRef(
    new Map<string, (val: any | PromiseLike<any>) => void>()
  )

  const post = useCallback((inputValue: string) => {
    let id = Math.random().toString() // TODO: nanoid
    childPort.postMessage('search', { id, inputValue })
    return new Promise<SgSearch[]>(resolve => {
      resolveMap.current.set(id, resolve)
    })
  }, [])

  useEffect(() => {
    childPort.onMessage('search', event => {
      const { id, searchResult } = event
      resolveMap.current.get(id)?.(searchResult)
      resolveMap.current.delete(id)
    })
  }, [])

  return post
}
