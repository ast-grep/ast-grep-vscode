import type { DisplayResult } from '../postMessage'
import { childPort } from '../postMessage'
import { useCallback, useDeferredValue, useSyncExternalStore } from 'react'
import { useDebounce } from 'react-use'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let grouped = [] as [string, DisplayResult[]][]
let queryInFlight = ''
let searching = true
let notify = () => {}

function postSearch(inputValue: string) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  searching = true
  grouped = []
  notify()
}

childPort.onMessage('searchResultStreaming', event => {
  if (event.id !== id) {
    return
  }
  queryInFlight = event.inputValue
  grouped = merge(groupBy(event.searchResult))
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

function groupBy(matches: DisplayResult[]) {
  const groups = new Map<string, DisplayResult[]>()
  for (const match of matches) {
    if (!groups.has(match.file)) {
      groups.set(match.file, [])
    }
    groups.get(match.file)!.push(match)
  }
  return groups
}

function merge(newEntries: Map<string, DisplayResult[]>) {
  // first, clone the old map for react
  let temp = new Map(grouped)
  for (const [file, newList] of newEntries) {
    const existing = temp.get(file) || []
    temp.set(file, existing.concat(newList))
  }
  return [...temp.entries()]
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

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResult = useDeferredValue(grouped)

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    queryInFlight,
    searching,
    groupedByFileSearchResult,
    searchCount: grouped.reduce((a, l) => a + l[1].length, 0),
    refreshSearchResult
  }
}
