import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import {
  useSearchField,
  refreshResult,
  hasInitialRewrite,
} from '../../hooks/useQuery'
import { useSearchResult, replaceAll } from '../../hooks/useSearch'
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
    height: 24,
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
      <VSCodeButton
        title="Replace All"
        appearance="icon"
        disabled={disabled}
        onClick={() => replaceAll()}
        {...stylex.props(styles.replaceAll)}
      >
        <VscReplaceAll />
      </VSCodeButton>
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
