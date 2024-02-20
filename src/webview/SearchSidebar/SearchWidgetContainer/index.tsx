import { useSearchQuery } from '../../hooks/useQuery'
import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

const SearchWidgetContainer = () => {
  const {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeFile,
    showOptions,
    toggleOptions,
    refreshResult
  } = useSearchQuery()

  return (
    <div style={{ margin: '0 12px 0 2px' }}>
      <SearchWidget
        inputValue={inputValue}
        setInputValue={setInputValue}
        refreshResult={refreshResult}
      />
      <SearchOptions
        includeFile={includeFile}
        setIncludeFile={setIncludeFile}
        refreshResult={refreshResult}
        showOptions={showOptions}
        toggleOptions={toggleOptions}
      />
    </div>
  )
}

export default SearchWidgetContainer
