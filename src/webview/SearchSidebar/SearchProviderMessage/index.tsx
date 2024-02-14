import { memo } from 'react'
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '6px 22px 8px',
  lineHeight: '1.4em'
}

const Empty = memo(() => {
  return (
    <div style={style}>
      No results found. Review your patterns and check your gitignore files. -{' '}
      <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
        Pattern Syntax
      </VSCodeLink>
    </div>
  )
})

interface SearchProviderMessageProps {
  resultCount: number
  fileCount: number
}

const SearchProviderMessage = ({
  resultCount,
  fileCount
}: SearchProviderMessageProps) => {
  return (
    <>
      {resultCount === 0 ? (
        <Empty />
      ) : (
        <div
          style={style}
        >{`${resultCount} results in ${fileCount} files`}</div>
      )}
    </>
  )
}

export default SearchProviderMessage
