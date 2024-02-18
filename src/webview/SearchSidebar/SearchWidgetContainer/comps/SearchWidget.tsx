import { SearchInput } from './SearchInput'
import { useBoolean } from 'react-use'
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    position: 'relative'
  },
  replaceToggle: {
    width: 16,
    height: '100%',
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      background: 'var(--vscode-toolbar-hoverBackground)'
    }
  },
  inputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginLeft: 18,
    flex: 1
  }
})

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
  const [isExpanded, toggleIsExpanded] = useBoolean(false)
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.replaceToggle)} onClick={toggleIsExpanded}>
        {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
      </div>
      <div {...stylex.props(styles.inputs)}>
        <SearchInput
          placeholder="Search"
          value={inputValue}
          onChange={setInputValue}
          onKeyEnterUp={refreshResult}
        />
        {isExpanded ? (
          <SearchInput
            placeholder="Replace not implemented yet"
            value=""
            onChange={() => {}}
            onKeyEnterUp={() => {}}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
