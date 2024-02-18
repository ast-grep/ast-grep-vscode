import { useCallback } from 'react'
import { useSearchQuery } from '../../hooks/useQuery'
import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

interface Props {
  refreshResult: () => void
  onQueryChange: (query: string) => void
}

const SearchWidgetContainer = ({ refreshResult, onQueryChange }: Props) => {
  const { inputValue, setInputValue } = useSearchQuery()
  const onChange = useCallback(
    (val: string) => {
      setInputValue(val)
      onQueryChange(val)
    },
    [onQueryChange, setInputValue]
  )
  return (
    <div>
      <SearchWidget
        inputValue={inputValue}
        setInputValue={onChange}
        refreshResult={refreshResult}
      />
      <SearchOptions />
    </div>
  )
}

export default SearchWidgetContainer
