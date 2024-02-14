import { memo } from 'react'
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '6px 22px 8px'
}

function Empty() {
  return (
    <div style={style}>
      No results found. Review your patterns and check your gitignore files. -{' '}
      <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
        Pattern Syntax
      </VSCodeLink>
    </div>
  )
}

export default memo(Empty)
