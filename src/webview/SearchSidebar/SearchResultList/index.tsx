import { useMemo } from 'react'
import { SgSearch } from '../../../types'
import TreeItem from './comps/TreeItem'
import { Box } from '@chakra-ui/react'

type SearchResultListProps = {
  matches: Array<SgSearch>
  pattern: string
}

const displayLimit = 2000
const SearchResultList = ({ matches, pattern }: SearchResultListProps) => {
  const groupedByFile = useMemo(() => {
    return matches.slice(0, displayLimit).reduce(
      (groups, match) => {
        if (!groups[match.file]) {
          groups[match.file] = []
        }

        groups[match.file].push(match)

        return groups
      },
      {} as Record<string, SgSearch[]>
    )
  }, [matches])

  return (
    <Box mt="10">
      {Object.entries(groupedByFile).map(([filePath, match]) => {
        return <TreeItem filePath={filePath} matches={match} key={filePath} />
      })}
    </Box>
  )
}

export default SearchResultList
