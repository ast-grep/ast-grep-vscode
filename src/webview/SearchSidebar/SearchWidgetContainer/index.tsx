import { useSearchQuery } from '../../hooks/useQuery'
import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

interface Props {
  onQueryChange: (query: string) => void
}

const SearchWidgetContainer = ({ onQueryChange }: Props) => {
  const { inputValue, setInputValue, refreshResult } =
    useSearchQuery(onQueryChange)
  return (
    <div>
      <SearchWidget
        inputValue={inputValue}
        setInputValue={setInputValue}
        refreshResult={refreshResult}
      />
      <SearchOptions />
    </div>
  )
}

export default SearchWidgetContainer
