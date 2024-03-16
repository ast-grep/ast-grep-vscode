import {
  useSearchField,
  refreshResult,
  hasInitialRewrite,
} from '../../hooks/useQuery'
import { useSearchResult } from '../../hooks/useSearch'
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
    background: 'transparent',
    color: 'inherit',
    ':hover': {
      background: 'var(--vscode-toolbar-hoverBackground)',
    },
    ':disabled': {
      color: 'var(--vscode-disabledForeground)',
      pointerEvents: 'none',
    },
  },
})

function ReplaceBar() {
  const [rewrite, setRewrite] = useSearchField('rewrite')
  const { searching, groupedByFileSearchResult } = useSearchResult()
  const disabled =
    !rewrite || searching || groupedByFileSearchResult.length === 0
  return (
    <div {...stylex.props(styles.replaceToolbar)}>
      <SearchInput
        placeholder="Replace"
        value={rewrite}
        onChange={setRewrite}
        onKeyEnterUp={refreshResult}
      />
      <button {...stylex.props(styles.replaceAll)} disabled={disabled}>
        <VscReplaceAll />
      </button>
    </div>
  )
}

function SearchWidgetContainer() {
  const [inputValue, setInputValue] = useSearchField('inputValue')
  const [isExpanded, toggleIsExpanded] = useBoolean(hasInitialRewrite())
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
        {isExpanded ? <ReplaceBar /> : null}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
