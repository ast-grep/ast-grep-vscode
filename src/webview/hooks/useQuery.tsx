import { useCallback, useEffect } from 'react'
import { useLocalStorage, useDebounce, useBoolean } from 'react-use'
import { SearchQuery } from '../../types'
import { childPort } from '../postMessage'
export { SearchQuery }
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'

export function useSearchQuery() {
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
    postSearch({
      inputValue,
      includeFile
    })
  }, [inputValue, includeFile])

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
