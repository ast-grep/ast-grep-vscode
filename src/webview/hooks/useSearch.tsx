import type { SgSearch } from '../postMessage'
import { childPort } from '../postMessage'
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useSyncExternalStore
} from 'react'
import { useDebounce } from 'react-use'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let searchResult: SgSearch[] = []
let queryInFlight = ''
let searching = true
let notify = () => {}

function postSearch(inputValue: string) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  searchResult = []
  searching = true
  notify()
}

childPort.onMessage('searchResultStreaming', event => {
  if (event.id !== id) {
    return
  }
  queryInFlight = event.inputValue
  searchResult = searchResult.concat(event.searchResult)
  notify()
})

childPort.onMessage('searchEnd', event => {
  if (event.id !== id) {
    return
  }
  searching = false
  queryInFlight = event.inputValue
  notify()
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

// version is for react to update view
let version = 114514
function subscribe(onChange: () => void): () => void {
  notify = () => {
    onChange()
    version = (version + 1) % MOD
  }
  return () => {
    // TODO: cleanup is not correct
    notify = () => {}
  }
}

function getSnapshot() {
  return version // symbolic snapshot for react
}

export const useSearchResult = (inputValue: string) => {
  useSyncExternalStore(subscribe, getSnapshot)

  const refreshSearchResult = useCallback(() => {
    // TODO: cancelled request, should send cancel to extension
    postSearch(inputValue)
  }, [inputValue])

  const grouped = useMemo(() => {
    return [...groupBy(searchResult).entries()]
  }, [searchResult])
  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResult = useDeferredValue(grouped)

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    queryInFlight,
    searching,
    searchResult,
    groupedByFileSearchResult,
    refreshSearchResult
  }
}
