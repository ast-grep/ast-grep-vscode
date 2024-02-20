import { useEffect } from 'react'
import { useLocalStorage, useDebounce, useBoolean } from 'react-use'
import { SearchQuery } from '../../types'
import { childPort } from '../postMessage'
export { SearchQuery }
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'

const searchQuery: Record<keyof SearchQuery, string> = {
  inputValue: '',
  includeFile: ''
}

const LS_KEYS: Record<keyof SearchQuery, string> = {
  inputValue: 'ast-grep-search-panel-input-value',
  includeFile: 'ast-grep-search-panel-include-value'
}

export function refreshResult() {
  postSearch(searchQuery)
}

export function useSearchField(key: keyof SearchQuery) {
  const [field = '', setField] = useLocalStorage(LS_KEYS[key], '')
  // this useEffect and useDebounce is silly
  useEffect(() => {
    searchQuery[key] = field
  }, [field])
  useDebounce(refreshResult, 150, [field])
  return [field, setField] as const
}

export function useSearchOption() {
  const [includeFile = '', setIncludeFile] = useSearchField('includeFile')
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
