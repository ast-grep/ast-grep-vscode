// maintains data list's UI state
// e.g. toggle expand selected item

import { useCallback, useEffect, useRef } from 'react'
import { useBoolean } from 'react-use'
import { onResultChange, findIndex } from '../../hooks/useSearch'
import type { DisplayResult } from '../../../types'
import type { VirtuosoHandle } from 'react-virtuoso'

let ref: VirtuosoHandle

export function refScroller(handle: VirtuosoHandle) {
  ref = handle
}

const collapseMap = new Map<string, boolean>()

onResultChange(() => {
  collapseMap.clear()
  lastActiveFile = ''
  activeItem = null
})

export function useToggleResult(filePath: string) {
  const collapsedBefore = collapseMap.get(filePath)
  const [isExpanded, toggle] = useBoolean(!collapsedBefore)
  const toggleIsExpanded = useCallback(() => {
    toggleResult(filePath)
    toggle()
    // jump to toggled files, only if it is at the top
    if (isExpanded && lastActiveFile === filePath) {
      const index = findIndex(filePath)
      if (index) {
        ref.scrollToIndex(index)
      }
    }
  }, [filePath, toggle, isExpanded])
  return [isExpanded, toggleIsExpanded] as const
}

let lastActiveFile = ''

function toggleResult(filePath: string) {
  if (collapseMap.has(filePath)) {
    collapseMap.delete(filePath)
  } else {
    collapseMap.set(filePath, true)
  }
}

export function useStickyShadow(filePath: string) {
  const [isScrolled, setScrolled] = useBoolean(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setScrolled(false)
      } else {
        setScrolled(true)
        if (!isScrolled) {
          lastActiveFile = filePath
        }
      }
    })
    observer.observe(ref.current!)
    return () => {
      observer.disconnect()
    }
  }, [isScrolled, setScrolled, filePath])
  return {
    isScrolled,
    ref,
  }
}

// Display for one match, Array for active header
type ActiveItem = DisplayResult | DisplayResult[]

let activeItem: ActiveItem | null = null
const refreshers: WeakMap<ActiveItem, (b: boolean) => void> = new WeakMap()
const activeFiles: Map<DisplayResult[], (b: boolean) => void> = new Map()

function setActive(item: ActiveItem) {
  if (activeItem) {
    refreshers.get(activeItem)?.(false)
  }
  refreshers.get(item)?.(true)
  activeItem = item
  for (const [matches, update] of activeFiles) {
    update(isActiveFile(matches))
  }
}

// is a match/file actively selected
export function useActiveItem(item: ActiveItem) {
  const [active, forceUpdate] = useBoolean(activeItem === item)
  useEffect(() => {
    refreshers.set(item, forceUpdate)
    return () => {
      refreshers.delete(item)
    }
  }, [item, forceUpdate])
  const set = useCallback(() => {
    setActive(item)
  }, [item])
  return [active, set] as const
}

function isActiveFile(matches: DisplayResult[]) {
  return matches === activeItem || matches.some(f => f === activeItem)
}

// tell if a file is active (has a selected match or file itself selected)
export function useActiveFile(matches: DisplayResult[]) {
  const [active, forceUpdate] = useBoolean(isActiveFile(matches))
  useEffect(() => {
    activeFiles.set(matches, forceUpdate)
    return () => {
      activeFiles.delete(matches)
    }
  }, [matches, forceUpdate])
  return active
}
