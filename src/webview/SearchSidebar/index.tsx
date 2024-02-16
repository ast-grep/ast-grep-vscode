import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { useLocalStorage } from 'react-use'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import { useDeferredValue } from 'react'

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const {
    queryInFlight,
    searchCount,
    groupedByFileSearchResult,
    refreshSearchResult,
    searching
  } = useSearchResult(inputValue)

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResultForRender = useDeferredValue(
    groupedByFileSearchResult
  )

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer
        inputValue={inputValue}
        refreshResult={refreshSearchResult}
        setInputValue={setInputValue}
      />
      <SearchProviderMessage
        pattern={queryInFlight}
        resultCount={searchCount}
        fileCount={groupedByFileSearchResult.length}
      />
      <SearchResultList matches={groupedByFileSearchResultForRender} />
    </UseDarkContextProvider>
  )
}
