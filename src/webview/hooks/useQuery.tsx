import { useLocalStorage } from 'react-use'
export function useSearchQuery() {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  const [includeFile = '', setIncludeValue] = useLocalStorage(
    'ast-grep-search-panel-include-value',
    ''
  )
  return {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeValue
  }
}
