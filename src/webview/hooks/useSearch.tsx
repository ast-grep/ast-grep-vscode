import type { SgSearch } from '../postMessage'
import { childPort } from '../postMessage'
import { useCallback, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let currentResolve: (r: SgSearch[]) => void
let currentReject = () => {}

function postSearch(inputValue: string) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  currentReject()
  return new Promise<SgSearch[]>((resolve, reject) => {
    currentResolve = resolve
    currentReject = reject
  })
}

childPort.onMessage('searchResultStreaming', event => {
  if (event.id !== id) {
    return
  }
  currentResolve(event.searchResult)
  currentResolve = () => {}
  currentReject = () => {}
})
childPort.onMessage('searchEnd', event => {
  if (event.id !== id) {
    return
  }
  currentResolve([])
  currentResolve = () => {}
  currentReject = () => {}
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
  const [searchResult, setResult] = useState<SgSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [queryInFlight, setQuery] = useState(inputValue)

  const refreshSearchResult = useCallback(() => {
    setSearching(true)
    postSearch(inputValue)
      .then(res => {
        setResult(res)
        setSearching(false)
        setQuery(inputValue)
      })
      .catch(() => {
        // TODO: cancelled request, should send cancel to extension
      })
  }, [inputValue])

  const groupedByFileSearchResult = useMemo(() => {
    return [...groupBy(searchResult).entries()]
  }, [searchResult])

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    queryInFlight,
    searching,
    searchResult,
    groupedByFileSearchResult,
    refreshSearchResult
  }
}
