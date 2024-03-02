import { memo } from 'react'
import { DisplayResult } from '../../../types'
import TreeItem from './TreeItem'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  resultList: {
    flexGrow: 1,
    overflowY: 'scroll',
    ':not(:hover) > div::before': {
      opacity: 0,
    },
    ':hover > div::before': {
      opacity: 1,
    },
  },
})

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  return (
    <div {...stylex.props(styles.resultList)}>
      {matches.map(([filePath, match]) => {
        return <TreeItem filePath={filePath} matches={match} key={filePath} />
      })}
    </div>
  )
}

export default memo(SearchResultList)
