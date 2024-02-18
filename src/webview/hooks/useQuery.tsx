import { useCallback } from 'react'
import { useLocalStorage } from 'react-use'
import { useDebounce } from 'react-use'

export interface SearchQuery {
  inputValue: string
  includeFile: string
}

export function useSearchQuery(startSearch: (query: SearchQuery) => void) {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const [includeFile = '', setIncludeValue] = useLocalStorage(
    'ast-grep-search-panel-include-value',
    ''
  )
  const refreshResult = useCallback(() => {
    startSearch({
      inputValue,
      includeFile
    })
  }, [inputValue, startSearch])

  // auto refresh result when input value changes
  useDebounce(refreshResult, 100, [inputValue])

  return {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeValue,
    refreshResult
  }
}
