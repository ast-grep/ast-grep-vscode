import React, { useCallback } from 'react'
import type { SgSearch } from '../../types'
import SearchResultsList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { useSgSearch } from './postMessage'
import { useEffect, useState } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'

const useSearchResult = (inputValue: string) => {
  const [searchResult, setResult] = useState<SgSearch[]>([])
  const postExtension = useSgSearch()

  const refreshSearchResult = useCallback(() => {
    ;(async () => {
      const res = await postExtension(inputValue)
      setResult(res)
    })()
  }, [postExtension, setResult])

  useDebounce(refreshSearchResult, 400, [inputValue])

  return {
    searchResult,
    refreshSearchResult
  }
}

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorage<string>(
    'ast-grep-search-panel-input-value',
    ''
  )
  const { searchResult, refreshSearchResult } = useSearchResult(inputValue)

  return (
    <div>
      <SearchWidgetContainer
        inputValue={inputValue}
        refreshResult={refreshSearchResult}
        setInputValue={setInputValue}
      />
      <SearchResultsList matches={searchResult} />
    </div>
  )
}
