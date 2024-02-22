import { memo } from 'react'
import { DisplayResult, SearchQuery } from '../../../types'
import TreeItem from './comps/TreeItem'

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
  query: SearchQuery
}

const SearchResultList = ({ matches, query }: SearchResultListProps) => {
  return (
    <div style={{ flexGrow: '1', overflowY: 'scroll' }}>
      {matches.map(([filePath, match]) => {
        return (
          <TreeItem
            query={query}
            filePath={filePath}
            matches={match}
            key={filePath}
          />
        )
      })}
    </div>
  )
}

export default memo(SearchResultList)
