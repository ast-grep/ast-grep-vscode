import type { SgSearch } from '../postMessage'
import { childPort } from '../postMessage'
import { useCallback, useMemo, useState, useRef } from 'react'
import { useDebounce } from 'react-use'

type StreamHandler = (r: SgSearch[]) => void

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let currentResolve: (id: number) => void
let currentReject = () => {}
let currentHandler: StreamHandler

function postSearch(inputValue: string, onStream: StreamHandler) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  currentReject()
  currentHandler = onStream
  return new Promise<number>((resolve, reject) => {
    currentResolve = resolve
    currentReject = reject
  })
}

childPort.onMessage('searchResultStreaming', event => {
  if (event.id !== id) {
    return
  }
  currentHandler(event.searchResult)
})
childPort.onMessage('searchEnd', event => {
  if (event.id !== id) {
    return
  }
  currentResolve(id)
  currentResolve = () => {}
  currentReject = () => {}
  currentHandler = () => {}
})

function groupBy(matches: SgSearch[]) {
  const groups = new Map<string, SgSearch[]>()
  for (const match of matches) {
    if (!groups.has(match.file)) {
      groups.set(match.file, [])
    }
    groups.get(match.file)!.push(match)
  }
  return groups
}

export const useSearchResult = (inputValue: string) => {
  const resultRef = useRef<SgSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [queryInFlight, setQuery] = useState(inputValue)

  const refreshSearchResult = useCallback(() => {
    setSearching(true)
    resultRef.current = []
    postSearch(inputValue, ret => {
      resultRef.current.push(...ret)
      setQuery(inputValue + resultRef.current.length)
    })
      .then(() => {
        setSearching(false)
      })
      .catch(() => {
        // TODO: cancelled request, should send cancel to extension
      })
  }, [inputValue])

  const groupedByFileSearchResult = useMemo(() => {
    return [...groupBy(resultRef.current).entries()]
  }, [resultRef.current.length])

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    queryInFlight,
    searching,
    searchResult: resultRef.current,
    groupedByFileSearchResult,
    refreshSearchResult
  }
}
