import { useEffect } from 'react'
import { useLocalStorage, useDebounce, useBoolean } from 'react-use'
import { SearchQuery } from '../../types'
import { childPort } from '../postMessage'
export { SearchQuery }
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'

const searchQuery = {
  inputValue: '',
  includeFile: ''
}

export function refreshResult() {
  postSearch(searchQuery)
}

export function useInputValue() {
  const [inputValue = '', setInputValue] = useLocalStorage(
    'ast-grep-search-panel-input-value',
    ''
  )
  useEffect(() => {
    searchQuery.inputValue = inputValue
  }, [inputValue])
  useDebounce(refreshResult, 150, [inputValue])
  return [inputValue, setInputValue] as const
}

function useIncludeFile() {
  const [includeFile = '', setIncludeFile] = useLocalStorage(
    'ast-grep-search-panel-include-value',
    ''
  )
  useEffect(() => {
    searchQuery.includeFile = includeFile
  }, [includeFile])
  useDebounce(refreshResult, 150, [includeFile])
  return [includeFile, setIncludeFile] as const
}

export function useSearchOption() {
  const [includeFile = '', setIncludeFile] = useIncludeFile()
  const [showOptions, toggleOptions] = useBoolean(Boolean(includeFile))

  useEffect(() => {
    childPort.onMessage('setIncludeFile', val => {
      setIncludeFile(val.includeFile)
      toggleOptions(true)
    })
  }, [])
  return {
    includeFile,
    setIncludeFile,
    showOptions,
    toggleOptions
  }
}
