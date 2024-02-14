import { useCallback, useMemo } from 'react'
import type { SgSearch } from '../../types'
import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { postSearch } from './postMessage'
import { useState } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'
import { UseDarkContextProvider } from './hooks/useDark'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'

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

const useSearchResult = (inputValue: string) => {
  const [searchResult, setResult] = useState<SgSearch[]>([])
  const [searching, setSearching] = useState(false)

  // TODO: setSearching has async racing condition here
  const refreshSearchResult = useCallback(() => {
    setSearching(true)
    postSearch(inputValue).then(res => {
      setResult(res)
      setSearching(false)
    })
  }, [postSearch, setResult, inputValue])

  const groupedByFileSearchResult = useMemo(() => {
    return [...groupBy(searchResult).entries()]
  }, [searchResult])

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    searching,
    searchResult,
    groupedByFileSearchResult,
    refreshSearchResult
  }
}

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const {
    searchResult,
    groupedByFileSearchResult,
    refreshSearchResult,
    searching
  } = useSearchResult(inputValue)

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer
        inputValue={inputValue}
        refreshResult={refreshSearchResult}
        setInputValue={setInputValue}
      />
      <SearchProviderMessage
        resultCount={searchResult.length}
        fileCount={groupedByFileSearchResult.length}
      />
      <SearchResultList matches={groupedByFileSearchResult} />
    </UseDarkContextProvider>
  )
}
