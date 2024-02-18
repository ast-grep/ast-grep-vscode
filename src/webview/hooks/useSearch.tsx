import type { DisplayResult } from '../postMessage'
import { childPort } from '../postMessage'
import { useSyncExternalStore } from 'react'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let grouped = [] as [string, DisplayResult[]][]
let queryInFlight = ''
let searching = true
let notify = () => {}
let searchError: Error | null = null
// we will not immediately drop previous result
// instead, use a stale flag and update it on streaming or end
let hasStaleResult = false

function postSearch(inputValue: string) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  searching = true
  hasStaleResult = true
  searchError = null
  notify()
}

childPort.onMessage('searchResultStreaming', event => {
  if (event.id !== id) {
    return
  }
  if (hasStaleResult) {
    // empty previous result
    hasStaleResult = false
    grouped = []
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
  if (hasStaleResult) {
    grouped = []
  }
  hasStaleResult = false
  queryInFlight = event.inputValue
  notify()
})

childPort.onMessage('error', event => {
  if (event.id !== id) {
    return
  }
  searchError = event.error
  searching = false
  grouped = []
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
    // snapshot should precede onChange
    version = (version + 1) % MOD
    onChange()
  }
  return () => {
    // TODO: cleanup is not correct
    notify = () => {}
  }
}

function getSnapshot() {
  return version // symbolic snapshot for react
}

export const useSearchResult = () => {
  useSyncExternalStore(subscribe, getSnapshot)
  return {
    queryInFlight,
    searching,
    searchError,
    groupedByFileSearchResult: grouped,
    searchCount: grouped.reduce((a, l) => a + l[1].length, 0),
    refreshSearchResult: postSearch
  }
}
