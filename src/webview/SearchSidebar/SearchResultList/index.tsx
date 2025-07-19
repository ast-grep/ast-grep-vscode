import * as stylex from '@stylexjs/stylex'
import { memo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { DisplayResult } from '../../../types'
import TreeItem from './TreeItem'
import { refScroller } from './useListState'

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

function itemContent(_: number, data: [string, DisplayResult[]]) {
  return <TreeItem className={'sg-match-tree-item'} matches={data[1]} />
}
function computeItemKey(_: number, data: [string, DisplayResult[]]) {
  return data[0]
}
const SearchResultList = ({ matches }: SearchResultListProps) => {
  return (
    <Virtuoso
      ref={refScroller}
      {...stylex.props(styles.resultList)}
      data={matches}
      itemContent={itemContent}
      computeItemKey={computeItemKey}
    />
  )
}

export default memo(SearchResultList)
