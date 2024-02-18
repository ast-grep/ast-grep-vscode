import { useCallback } from 'react'
import { useLocalStorage } from 'react-use'
import { useDebounce } from 'react-use'
import { SearchQuery } from '../../types'
export { SearchQuery }

export function useSearchQuery(startSearch: (query: SearchQuery) => void) {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const [includeFile = '', setIncludeFile] = useLocalStorage(
    'ast-grep-search-panel-include-value',
    ''
  )
  const refreshResult = useCallback(() => {
    startSearch({
      inputValue,
      includeFile
    })
  }, [inputValue, includeFile, startSearch])

  // auto refresh result when input value changes
  useDebounce(refreshResult, 100, [inputValue, includeFile])

  return {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeFile,
    refreshResult
  }
}
