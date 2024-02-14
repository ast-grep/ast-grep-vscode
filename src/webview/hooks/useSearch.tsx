import type { SgSearch } from '../postMessage'
import { childPort } from '../postMessage'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let currentResolve: (r: SgSearch[]) => void
let currentReject = () => {}

export function postSearch(inputValue: string) {
  id = (id + 1) % MOD
  childPort.postMessage('search', { id, inputValue })
  currentReject()
  return new Promise<SgSearch[]>((resolve, reject) => {
    currentResolve = resolve
    currentReject = reject
  })
}

childPort.onMessage('search', event => {
  if (event.id !== id) {
    return
  }
  currentResolve(event.searchResult)
  currentResolve = () => {}
  currentReject = () => {}
})
