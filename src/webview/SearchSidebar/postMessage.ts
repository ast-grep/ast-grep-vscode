import type { SgSearch, ChildPort } from '../../types'
import { useCallback, useEffect, useRef } from 'react'
import { Unport } from 'unport'

let vscode: any
try {
  vscode =
    // @ts-ignore
    acquireVsCodeApi()
  // @ts-ignore
  window.vscode = vscode
} catch (e) {
  // @ts-ignore
  vscode = window.vscode
}

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

export const openFile = (data: {
  filePath: string
  locationsToSelect?: Array<Omit<SgSearch['range'], 'byteOffset'>>
  locationsToDecorate?: Array<Omit<SgSearch['range'], 'byteOffset'>>
}) => {
  childPort.postMessage('openfile', data)
}
