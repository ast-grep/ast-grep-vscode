import SearchOptions from './comps/SearchOptions'
import SearchWidget from './comps/SearchWidget'

interface Props {
  inputValue: string
  setInputValue: (value: string) => void
  refreshResult: () => void
}

const SearchWidgetContainer = ({
  inputValue,
  setInputValue,
  refreshResult
}: Props) => {
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
