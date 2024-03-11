// maintains data list's UI state
// e.g. toggle expand selected item

import { useCallback } from 'react'
import { useBoolean } from 'react-use'
import { onResultChange } from '../../hooks/useSearch'

const collapseMap = new Map<string, boolean>()

onResultChange(() => {
  collapseMap.clear()
})

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
