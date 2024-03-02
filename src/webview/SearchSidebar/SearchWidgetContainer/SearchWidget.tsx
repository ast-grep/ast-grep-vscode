import { useSearchField, refreshResult } from '../../hooks/useQuery'
import { SearchInput } from './SearchInput'
import { useBoolean } from 'react-use'
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    position: 'relative',
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
      background: 'var(--vscode-toolbar-hoverBackground)',
    },
  },
  inputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginLeft: 18,
    flex: 1,
  },
})

function SearchWidgetContainer() {
  const [inputValue, setInputValue] = useSearchField('inputValue')
  const [rewrite, setRewrite] = useSearchField('rewrite')
  const [isExpanded, toggleIsExpanded] = useBoolean(Boolean(rewrite))
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
            placeholder="Replace"
            value={rewrite}
            onChange={setRewrite}
            onKeyEnterUp={refreshResult}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
