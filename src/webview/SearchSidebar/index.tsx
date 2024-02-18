import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import { useDeferredValue } from 'react'

export const SearchSidebar = () => {
  const {
    queryInFlight,
    searchCount,
    groupedByFileSearchResult,
    refreshSearchResult,
    searching,
    searchError
  } = useSearchResult()

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResultForRender = useDeferredValue(
    groupedByFileSearchResult
  )

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer onQueryChange={refreshSearchResult} />
      <SearchProviderMessage
        pattern={queryInFlight}
        error={searchError}
        resultCount={searchCount}
        fileCount={groupedByFileSearchResult.length}
      />
      <SearchResultList matches={groupedByFileSearchResultForRender} />
    </UseDarkContextProvider>
  )
}
