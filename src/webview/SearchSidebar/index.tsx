import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { useLocalStorage } from 'react-use'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'

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
