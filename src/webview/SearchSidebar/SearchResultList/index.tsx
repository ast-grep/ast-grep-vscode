import { useMemo, memo } from 'react'
import { SgSearch } from '../../../types'
import TreeItem from './comps/TreeItem'
import { Box } from '@chakra-ui/react'

interface SearchResultListProps {
  matches: Array<SgSearch>
}

function groupBy(matches: SgSearch[]) {
  const groups = new Map<string, SgSearch[]>()
  for (const match of matches) {
    if (!groups.has(match.file)) {
      groups.set(match.file, [])
    }
    groups.get(match.file)?.push(match)
  }
  return groups
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  const groupedByFile = useMemo(() => {
    return groupBy(matches)
  }, [matches])

  return (
    <Box mt="10">
      {[...groupedByFile.entries()].map(([filePath, match]) => {
        return <TreeItem filePath={filePath} matches={match} key={filePath} />
      })}
    </Box>
  )
}

export default memo(SearchResultList)
