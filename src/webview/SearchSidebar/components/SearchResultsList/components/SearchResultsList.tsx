import { Button, Flex, Text, Spinner } from '@chakra-ui/react'
// import { MatchWithFileInfo, Mode, SearchResults } from '@codeque/core'
// import { SearchResult } from './SearchResult'
// import { TextModeNoResults } from './TextModeNoResults'
// import { StructuralModeNoResults } from './StructuralModeNoResults'
import { memo, useCallback, useMemo, useRef } from 'react'
import { FileGroup } from './FileGroup'
import { WorkspaceGroup } from './WorkspaceGroup'
import type { MatchWithFileInfo } from '../types'

type SearchResultsListProps = {
  matches:Array<MatchWithFileInfo>
  getRelativePath: (filePath: string) => string | undefined
  getWorkspace: (filePath: string) => string | undefined
  displayLimit: number
  extendDisplayLimit: () => void
  showAllResults: () => void
  removeMatch: (filePath: string, start: number, end: number) => void
  removeFile: (filePath: string) => void
  removeWorkspace: (workspace: string) => void
  isLoading: boolean
  // searchMode: Mode | null
  isWorkspace: boolean
}

export const SearchResultsList = memo(function SearchResultsList({
  matches,
  getRelativePath,
  displayLimit,
  showAllResults,
  extendDisplayLimit,
  removeMatch,
  isLoading,
  // searchMode,
  removeFile,
  isWorkspace,
  getWorkspace,
  removeWorkspace,
}: SearchResultsListProps) {
  const groupedByFile = useMemo(() => {
    return matches.slice(0, displayLimit).reduce((groups, match) => {
      if (!groups[match.filePath]) {
        groups[match.filePath] = []
      }

      groups[match.filePath].push(match)

      return groups
    }, {} as Record<string, MatchWithFileInfo[]>)
  }, [matches, displayLimit])

  const groupedByWorkspace = useMemo(() => {
    if (!isWorkspace) {
      return null
    }

    return Object.entries(groupedByFile).reduce(
      (groups, [filePath, matches]) => {
        const workspace = getWorkspace(filePath) ?? ''

        groups[workspace] = {
          ...(groups[workspace] ?? {}),
          [filePath]: matches,
        }

        return groups
      },
      {} as Record<string, Record<string, MatchWithFileInfo[]>>,
    )
  }, [isWorkspace, groupedByFile])

  const scrollElRef = useRef<HTMLDivElement>(null)

  const renderFileGroup = useCallback(
    (hasWorkspace: boolean) =>
      ([filePath, matches]: [string, MatchWithFileInfo[]]) =>
        (
          <FileGroup
            key={filePath}
            matches={matches}
            getRelativePath={getRelativePath}
            removeMatch={removeMatch}
            filePath={filePath}
            removeFile={removeFile}
            hasWorkspace={hasWorkspace}
            scrollElRef={scrollElRef}
          />
        ),
    [getRelativePath, removeMatch, removeFile],
  )

  // if (matches.length === 0) {
  //   return (
  //     <Flex width="100%" height="100%" justifyContent="center" overflowY="auto">
  //       {isLoading ? (
  //         <Spinner margin="auto" />
  //       ) : searchMode === 'text' ? (
  //         <TextModeNoResults />
  //       ) : (
  //         <StructuralModeNoResults />
  //       )}
  //     </Flex>
  //   )
  // }

  return (
    <Flex flexDir="column" mt="5" overflowY="auto" ref={scrollElRef}>
      {groupedByWorkspace
        ? Object.entries(groupedByWorkspace).map(([workspace, fileGroups]) => (
            <WorkspaceGroup
              key={workspace}
              allCount={Object.values(fileGroups)
                .map((matches) => matches.length)
                .reduce((sum, count) => sum + count, 0)}
              workspace={workspace}
              removeWorkspace={removeWorkspace}
              scrollElRef={scrollElRef}
            >
              {Object.entries(fileGroups).map(renderFileGroup(true))}
            </WorkspaceGroup>
          ))
        : Object.entries(groupedByFile).map(renderFileGroup(false))}
      {/* {matchs.length > displayLimit ? (
        <Flex justifyContent="center" m="5">
          <Button onClick={extendDisplayLimit} colorScheme="blue">
            Show more
          </Button>
          <Button ml="5" onClick={showAllResults} colorScheme="blue">
            Show all ({matches.length})
          </Button>
        </Flex>
      ) : null} */}
      {isLoading ? (
        <Flex justifyContent="center" mt="5" mb="5">
          <Spinner margin="auto" />
        </Flex>
      ) : null}
    </Flex>
  )
})
