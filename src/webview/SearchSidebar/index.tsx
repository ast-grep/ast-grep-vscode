import { useCallback } from 'react'
import type { SgSearch } from '../../types'
import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { postSearch } from './postMessage'
import { useState } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'
import { UseDarkContextProvider } from './hooks/useDark'

const useSearchResult = (inputValue: string) => {
  const [searchResult, setResult] = useState<SgSearch[]>([])

  const refreshSearchResult = useCallback(() => {
    postSearch(inputValue).then(setResult)
  }, [postSearch, setResult, inputValue])

  useDebounce(refreshSearchResult, 400, [inputValue])

  return {
    searchResult,
    refreshSearchResult
  }
}

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const { searchResult, refreshSearchResult } = useSearchResult(inputValue)

  return (
    <UseDarkContextProvider>
      <SearchWidgetContainer
        inputValue={inputValue}
        refreshResult={refreshSearchResult}
        setInputValue={setInputValue}
      />
      <SearchResultList matches={searchResult} />
    </UseDarkContextProvider>
  )
}
