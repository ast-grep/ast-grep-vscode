import { useCallback, useEffect } from 'react'
import { useLocalStorage, useDebounce, useBoolean } from 'react-use'
import { SearchQuery } from '../../types'
import { childPort } from '../postMessage'
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
  const [showOptions, toggleOptions] = useBoolean(Boolean(includeFile))
  const refreshResult = useCallback(() => {
    startSearch({
      inputValue,
      includeFile
    })
  }, [inputValue, includeFile, startSearch])

  useEffect(() => {
    childPort.onMessage('setIncludeFile', val => {
      setIncludeFile(val.includeFile)
      toggleOptions(true)
    })
  }, [])

  // auto refresh result when input value changes
  useDebounce(refreshResult, 100, [inputValue, includeFile])

  return {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeFile,
    refreshResult,
    showOptions,
    toggleOptions
  }
}
