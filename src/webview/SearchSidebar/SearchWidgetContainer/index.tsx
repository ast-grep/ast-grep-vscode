import { useSearchQuery, SearchQuery } from '../../hooks/useQuery'
import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

interface Props {
  onQueryChange: (query: SearchQuery) => void
}

const SearchWidgetContainer = ({ onQueryChange }: Props) => {
  const {
    inputValue,
    setInputValue,
    includeFile,
    setIncludeFile,
    refreshResult
  } = useSearchQuery(onQueryChange)

  return (
    <div>
      <SearchWidget
        inputValue={inputValue}
        setInputValue={setInputValue}
        refreshResult={refreshResult}
      />
      <SearchOptions
        includeFile={includeFile}
        setIncludeFile={setIncludeFile}
        refreshResult={refreshResult}
      />
    </div>
  )
}

export default SearchWidgetContainer
