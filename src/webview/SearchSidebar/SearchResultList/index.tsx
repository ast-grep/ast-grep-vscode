import { memo, useCallback, useLayoutEffect } from 'react'
import type { DisplayResult } from '../../../types'
import TreeItem from './TreeItem'
import { refScroller } from './useListState'
import * as stylex from '@stylexjs/stylex'
import { Virtuoso } from 'react-virtuoso'

const styles = stylex.create({
  resultList: {
    flexGrow: 1,
    overflowY: 'scroll',
    ':not(:hover) .sg-match-tree-item::before': {
      opacity: 0,
    },
    ':hover .sg-match-tree-item::before': {
      opacity: 1,
    },
  },
})

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  const render = useCallback(
    (index: number) => {
      const [filePath, match] = matches[index]
      return (
        <TreeItem
          className={'sg-match-tree-item'}
          matches={match}
          key={filePath}
        />
      )
    },
    [matches],
  )
  // sadly, Virtuoso does not support overriding viewport
  useLayoutEffect(function setViewportStyle() {
    document.querySelector<HTMLElement>(
      '[data-viewport-type]',
    )!.style.overflowY = 'scroll'
  }, [])
  return (
    <Virtuoso
      ref={refScroller}
      {...stylex.props(styles.resultList)}
      totalCount={matches.length}
      itemContent={render}
    />
  )
}

export default memo(SearchResultList)
