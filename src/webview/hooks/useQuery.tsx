import { useCallback } from 'react'
import { useLocalStorage } from 'react-use'
import { useDebounce } from 'react-use'

export function useSearchQuery(onQueryChange: (query: string) => void) {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const [includeFile = '', setIncludeValue] = useLocalStorage(
    'ast-grep-search-panel-include-value',
    ''
  )
  const refreshResult = useCallback(() => {
    onQueryChange(inputValue)
  }, [inputValue, onQueryChange])

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
