import { useCallback } from 'react'
import type { SgSearch } from '../../types'
import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { postSearch } from './postMessage'
import { useState } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'
import { UseDarkContextProvider } from './hooks/useDark'
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react'

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

  useDebounce(refreshSearchResult, 100, [inputValue])

  return {
    searching,
    searchResult,
    refreshSearchResult
  }
}

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const { searchResult, refreshSearchResult, searching } =
    useSearchResult(inputValue)

  return (
    <UseDarkContextProvider>
      <SearchWidgetContainer
        inputValue={inputValue}
        refreshResult={refreshSearchResult}
        setInputValue={setInputValue}
      />
      {searching ? (
        <VSCodeProgressRing />
      ) : (
        <SearchResultList matches={searchResult} />
      )}
    </UseDarkContextProvider>
  )
}
