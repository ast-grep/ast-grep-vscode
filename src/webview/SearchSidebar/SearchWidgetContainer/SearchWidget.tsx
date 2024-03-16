import { useSearchField, refreshResult } from '../../hooks/useQuery'
import { SearchInput } from './SearchInput'
import { useBoolean } from 'react-use'
import { VscChevronRight, VscChevronDown, VscReplaceAll } from 'react-icons/vsc'
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
  replaceToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  replaceAll: {
    cursor: 'pointer',
    height: 24,
    marginRight: -2,
    padding: '0 3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '5px',
    ':hover': {
      background: 'var(--vscode-toolbar-hoverBackground)',
    },
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
          <div {...stylex.props(styles.replaceToolbar)}>
            <SearchInput
              placeholder="Replace"
              value={rewrite}
              onChange={setRewrite}
              onKeyEnterUp={refreshResult}
            />
            <span {...stylex.props(styles.replaceAll)}>
              <VscReplaceAll />
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
