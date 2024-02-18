import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import { useCallback, useDeferredValue, useState } from 'react'

export const SearchSidebar = () => {
  const [query, setQuery] = useState('')
  const {
    queryInFlight,
    searchCount,
    groupedByFileSearchResult,
    refreshSearchResult,
    searching,
    searchError
  } = useSearchResult(query)

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResultForRender = useDeferredValue(
    groupedByFileSearchResult
  )

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer
        onQueryChange={setQuery}
        refreshResult={refreshSearchResult}
      />
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
