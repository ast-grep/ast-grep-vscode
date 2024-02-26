import {
  DisplayResult,
  OpenPayload,
  openFile,
  previewDiff,
} from '../postMessage'
import { childPort } from '../postMessage'
import { useSyncExternalStore } from 'react'
import { SearchQuery } from './useQuery'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let grouped: Map<string, DisplayResult[]> = new Map()
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
    grouped = new Map()
  }
  queryInFlight = query
  grouped = merge(grouped, groupBy(event.searchResult))
  notify()
})

childPort.onMessage('searchEnd', event => {
  const { id: eventId, ...query } = event
  if (eventId !== id) {
    return
  }
  searching = false
  if (hasStaleResult) {
    grouped = new Map()
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
  grouped = new Map()
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

function merge(
  previousEntries: Map<string, DisplayResult[]>,
  newEntries: Map<string, DisplayResult[]>,
) {
  if (newEntries.size === 0) {
    return previousEntries
  }

  // calculate all group keys after merging.
  const currentGroupKeys = new Set(previousEntries.keys())
  for (const key of newEntries.keys()) {
    currentGroupKeys.add(key)
  }

  const currentEntries = new Map()
  for (const key of currentGroupKeys) {
    const newItemsInGroup = newEntries.get(key)
    if (newItemsInGroup === undefined) {
      // this group is not changed, reuse the existed array.
      currentEntries.set(key, previousEntries.get(key))
      continue
    }

    const previousItemsInGroup = previousEntries.get(key)
    if (previousItemsInGroup) {
      currentEntries.set(key, previousItemsInGroup.concat(newItemsInGroup))
    } else {
      currentEntries.set(key, newItemsInGroup)
    }
  }

  return currentEntries
}

function subscribe(onChange: () => void): () => void {
  notify = () => {
    onChange()
  }
  return () => {
    // TODO: cleanup is not correct
    notify = () => {}
  }
}

function getSnapshot() {
  return grouped
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
