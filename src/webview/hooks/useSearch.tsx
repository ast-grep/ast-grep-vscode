import {
  DisplayResult,
  OpenPayload,
  openFile,
  previewDiff,
  commitChange,
  childPort,
  RangeInfo,
} from '../postMessage'
import { useSyncExternalStore } from 'react'
import { SearchQuery } from './useQuery'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let grouped: [string, DisplayResult[]][] = []
let queryInFlight: SearchQuery = {
  inputValue: '',
  includeFile: '',
  rewrite: '',
}
let searching = true
let notify = () => {}
let searchError: Error | null = null
// we will not immediately drop previous result
// instead, use a stale flag and update it on streaming or end
let hasStaleResult = false

// this function is also called in useQuery
function postSearch(searchQuery: SearchQuery) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, ...searchQuery })
  searching = true
  hasStaleResult = true
  searchError = null
  notify()
}

childPort.onMessage('searchResultStreaming', event => {
  const { id: eventId, ...query } = event
  if (eventId !== id) {
    return
  }
  if (hasStaleResult) {
    // empty previous result
    hasStaleResult = false
    grouped = []
  }
  queryInFlight = query
  grouped = merge(groupBy(event.searchResult))
  notify()
})

childPort.onMessage('searchEnd', event => {
  const { id: eventId, ...query } = event
  if (eventId !== id) {
    return
  }
  searching = false
  if (hasStaleResult) {
    grouped = []
  }
  hasStaleResult = false
  queryInFlight = query
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

childPort.onMessage('refreshSearchResult', event => {
  if (event.id !== id) {
    return
  }
  const { fileName, updatedResults } = event
  const temp = new Map(grouped)
  if (updatedResults.length === 0) {
    temp.delete(fileName)
  } else {
    temp.set(fileName, updatedResults)
  }
  grouped = [...temp.entries()]
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
  const temp = new Map(grouped)
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

/**
 * Either open a file or preview the diff
 */
export function openAction(payload: OpenPayload) {
  if (queryInFlight.rewrite) {
    previewDiff({
      ...payload,
      rewrite: queryInFlight.rewrite,
      inputValue: queryInFlight.inputValue,
    })
  } else {
    openFile(payload)
  }
}

export const useSearchResult = () => {
  useSyncExternalStore(subscribe, getSnapshot)
  return {
    queryInFlight,
    searching,
    searchError,
    groupedByFileSearchResult: grouped,
  }
}
export { postSearch }

export function acceptChangeAndRefresh(args: {
  filePath: string
  changes: {
    replacement: string
    range: RangeInfo
  }[]
}) {
  commitChange({
    id,
    ...queryInFlight,
    ...args,
  })
}

export function acceptFileChanges(filePath: string) {
  // TODO
}
