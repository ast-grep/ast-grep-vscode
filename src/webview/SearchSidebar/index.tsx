import { useDeferredValue } from 'react'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'

export const SearchSidebar = () => {
  const { queryInFlight, groupedByFileSearchResult, searching, searchError } = useSearchResult()

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResultForRender = useDeferredValue(
    groupedByFileSearchResult,
  )

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer />
      <SearchProviderMessage
        query={queryInFlight}
        error={searchError}
        results={groupedByFileSearchResult}
      />
      <SearchResultList matches={groupedByFileSearchResultForRender} />
    </UseDarkContextProvider>
  )
}
