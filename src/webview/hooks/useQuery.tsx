import { useEffect, useState } from 'react'
import {
  useLocalStorage,
  useDebounce,
  useBoolean as useBooleanHook,
} from 'react-use'
import { SearchQuery } from '../../types'
import { childPort } from '../postMessage'
export { SearchQuery }
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'

const searchQuery: SearchQuery = {
  pattern: '',
  strictness: 'smart',
  selector: '',
  includeFile: '',
  rewrite: '',
  lang: '',
  allowEmptyReplace: false,
}

type PatternKeys = 'selector'

type BooleanKeys = 'allowEmptyReplace'

type StringKeys = Exclude<keyof SearchQuery, PatternKeys | BooleanKeys>

const LS_KEYS: Record<Exclude<keyof SearchQuery, PatternKeys>, string> = {
  pattern: 'ast-grep-search-panel-input-value',
  includeFile: 'ast-grep-search-panel-include-value',
  rewrite: 'ast-grep-search-panel-rewrite-value',
  strictness: 'ast-grep-search-panel-strictness-value',
  lang: 'ast-grep-search-panel-lang-value',
  allowEmptyReplace: 'ast-grep-search-panel-allow-empty-replace-value',
}

export function refreshResult() {
  postSearch(searchQuery)
}
childPort.onMessage('refreshAllSearch', refreshResult)
childPort.onMessage('clearSearchResults', () => {
  searchQuery.pattern = ''
  refreshResult()
})

export function useBoolean(key: BooleanKeys) {
  const [field, setField] = useLocalStorage(LS_KEYS[key], '')

  useEffect(() => {
    searchQuery[key] = field === 'true'
  }, [field, setField])

  useDebounce(refreshResult, 150, [field])

  return [field, setField] as const
}

export function useSearchField(key: StringKeys) {
  const [field = '', setField] = useLocalStorage(LS_KEYS[key], '')
  // this useEffect and useDebounce is silly
  useEffect(() => {
    searchQuery[key] = field
  }, [field, key])
  // this is really BAD code :(
  useEffect(() => {
    if (key !== 'pattern') {
      return
    }
    childPort.onMessage('searchByCode', ({ text }) => {
      searchQuery[key] = field
      setField(text)
      refreshResult()
    })
  }, [key, field, setField])
  useDebounce(refreshResult, 150, [field])
  return [field, setField] as const
}

export function usePatternConfig(key: PatternKeys) {
  const [field, setField] = useState(searchQuery[key])
  // this useEffect and useDebounce is silly
  useEffect(() => {
    searchQuery[key] = field
  }, [field, key])
  useDebounce(refreshResult, 150, [field])
  return [field, setField] as const
}

export function useSearchOption() {
  const [includeFile = '', setIncludeFile] = useSearchField('includeFile')
  const [showOptions, toggleOptions] = useBooleanHook(Boolean(includeFile))

  useEffect(() => {
    childPort.onMessage('setIncludeFile', val => {
      setIncludeFile(val.includeFile)
      toggleOptions(true)
    })
  }, [toggleOptions, setIncludeFile])
  return {
    includeFile,
    setIncludeFile,
    showOptions,
    toggleOptions,
  }
}

export function hasInitialRewrite() {
  return Boolean(localStorage.getItem(LS_KEYS.rewrite))
}
