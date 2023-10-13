import { useCallback, useEffect, useRef } from 'react'

const vscode =
  // @ts-ignore
  acquireVsCodeApi()
// @ts-ignore
window.vscode = vscode

export interface MessageRequest {
  inputValue: string
}

export interface MessageResponse {
  data: {
    uri: string
    // Same as vscode.Range but all zero-based
    position: {
      start: {
        character: number
        line: number
      }
      end: {
        character: number
        line: number
      }
    }
    content: string
  }[]
}

const noop = (arg: any) => arg

const usePostMessage = <Req, Res>({
  deserialize = noop
}: {
  deserialize: (arg: unknown) => Res
}) => {
  const resolveMap = useRef<
    Record<string, (val: any | PromiseLike<any>) => void>
  >({})

  const post = useCallback((req: Req) => {
    let id = Math.random().toString()
    vscode.postMessage({ ...req, id })
    return new Promise<Res>(resolve => {
      resolveMap.current[id] = resolve
    })
  }, [])

  useEffect(() => {
    const subscribe = (event: { data: Res & { id: string } }) => {
      const response = event.data
      const { id } = response
      const deserializedResponse = deserialize(response)
      resolveMap.current[id]?.(deserializedResponse)
      delete resolveMap.current[id]
    }
    window.addEventListener('message', subscribe)
    return () => {
      window.removeEventListener('message', subscribe)
    }
  }, [])

  return post
}

const usePostExtension = () =>
  usePostMessage<MessageRequest, MessageResponse>({
    deserialize: (arg: unknown) => {
      return {
        ...(arg as MessageResponse),
        data: (arg as MessageResponse)?.data?.map(item => {
          return item
        })
      }
    }
  })

export { usePostExtension }
