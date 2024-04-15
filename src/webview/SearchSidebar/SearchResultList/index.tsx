import { memo, useCallback } from 'react'
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
      const match = matches[index][1]
      return <TreeItem className={'sg-match-tree-item'} matches={match} />
    },
    [matches],
  )
  const computeItemKey = useCallback(
    (index: number) => {
      return matches[index][0]
    },
    [matches],
  )
  return (
    <Virtuoso
      ref={refScroller}
      {...stylex.props(styles.resultList)}
      totalCount={matches.length}
      itemContent={render}
      computeItemKey={computeItemKey}
    />
  )
}

export default memo(SearchResultList)
