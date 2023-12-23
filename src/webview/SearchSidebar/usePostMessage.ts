import { SgSearch } from '../../types'
import { useCallback, useEffect, useRef } from 'react'

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

export type MessageRequest = {
  inputValue: string
  command: 'search'
}

export interface MessageResponse {
  data: SgSearch[]
}

const usePostMessage = <Req, Res>() => {
  const resolveMap = useRef(
    new Map<string, (val: any | PromiseLike<any>) => void>()
  )

  const post = useCallback((req: Req) => {
    let id = Math.random().toString() // TODO: nanoid
    vscode.postMessage({ ...req, id })
    return new Promise<Res>(resolve => {
      resolveMap.current.set(id, resolve)
    })
  }, [])

  useEffect(() => {
    const subscribe = (event: { data: Res & { id: string } }) => {
      const response = event.data
      const { id } = response
      resolveMap.current.get(id)?.(response)
      resolveMap.current.delete(id)
    }
    window.addEventListener('message', subscribe)
    return () => {
      window.removeEventListener('message', subscribe)
    }
  }, [])

  return post
}

const usePostExtension = () => usePostMessage<MessageRequest, MessageResponse>()

export { usePostExtension }
