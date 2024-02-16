import { memo } from 'react'
import { DisplayResult } from '../../../types'
import TreeItem from './comps/TreeItem'

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  return (
    <div>
      {matches.map(([filePath, match]) => {
        return <TreeItem filePath={filePath} matches={match} key={filePath} />
      })}
    </div>
  )
}

export default memo(SearchResultList)
