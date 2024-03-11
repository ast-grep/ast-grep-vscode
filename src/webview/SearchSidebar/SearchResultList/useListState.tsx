// maintains data list's UI state
// e.g. toggle expand selected item

import { useCallback } from 'react'
import { useBoolean } from 'react-use'

const collapseMap = new Map<string, boolean>()

export function useToggleResult(filePath: string) {
  const collapsedBefore = collapseMap.get(filePath)
  const [isExpanded, toggle] = useBoolean(!collapsedBefore)
  const toggleIsExpanded = useCallback(() => {
    toggleResult(filePath)
    toggle()
  }, [filePath, toggle])
  return [isExpanded, toggleIsExpanded] as const
}

function toggleResult(filePath: string) {
  if (collapseMap.has(filePath)) {
    collapseMap.delete(filePath)
  } else {
    collapseMap.set(filePath, true)
  }
}

// let activeItem: DisplayResult | null = null

// function setActiveItem(match: DisplayResult) {

// }
