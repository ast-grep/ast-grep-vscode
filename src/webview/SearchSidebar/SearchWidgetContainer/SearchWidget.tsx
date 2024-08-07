import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import {
  useSearchField,
  refreshResult,
  hasInitialRewrite,
} from '../../hooks/useQuery'
import { childPort } from '../../postMessage'
import { useSearchResult, acceptAllChanges } from '../../hooks/useSearch'
import { SearchInput } from './SearchInput'
import { LangSelect } from './LangSelect'
import { useBoolean, useEffectOnce } from 'react-use'
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
    marginRight: -2,
  },
})

function ReplaceBar() {
  const [rewrite, setRewrite] = useSearchField('rewrite')
  const { searching, groupedByFileSearchResult } = useSearchResult()
  const disabled =
    !rewrite || searching || groupedByFileSearchResult.length === 0
  // sadly unport does not support unsub
  useEffectOnce(() => {
    childPort.onMessage('clearSearchResults', () => {
      setRewrite('')
    })
  })
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
        onClick={acceptAllChanges}
        {...stylex.props(styles.replaceAll)}
      >
        <VscReplaceAll />
      </VSCodeButton>
    </div>
  )
}

function SearchWidgetContainer() {
  const [pattern, setPattern] = useSearchField('pattern')
  const [isExpanded, toggleIsExpanded] = useBoolean(hasInitialRewrite())
  // sadly unport does not support unsub
  useEffectOnce(() => {
    childPort.onMessage('clearSearchResults', () => {
      setPattern('')
    })
  })
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.replaceToggle)} onClick={toggleIsExpanded}>
        {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
      </div>
      <div {...stylex.props(styles.inputs)}>
        <SearchInput
          placeholder="Search"
          value={pattern}
          onChange={setPattern}
          onKeyEnterUp={refreshResult}
        />
        <LangSelect />
        {isExpanded ? <ReplaceBar /> : null}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
