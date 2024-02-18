import { memo } from 'react'
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'
import { DisplayResult } from '../../../types'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '0 22px 8px',
  lineHeight: '1.4em'
}

const ulStyle = {
  listStyle: 'inside',
  listStyleType: '"- "',
  marginTop: '6px',
  overflowWrap: 'break-word'
} as const

function Empty({ pattern }: { pattern: string }) {
  if (!pattern) {
    return null
  }
  return (
    <div style={style}>
      No results found for <code>{pattern}</code>.
      <br />
      If this is not expected, you can try:
      <ul style={ulStyle}>
        <li>
          Ensure the query follows the{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
            Pattern Syntax
          </VSCodeLink>
          .
        </li>
        <li>
          Check if the file types are{' '}
          <VSCodeLink href="https://ast-grep.github.io/reference/languages.html">
            Supported
          </VSCodeLink>
          .
        </li>
        <li>
          Adjust your gitignore files.{' '}
          <VSCodeLink href="https://ast-grep.github.io/reference/cli/run.html#no-ignore-file-type">
            See doc.
          </VSCodeLink>
        </li>
      </ul>
    </div>
  )
}

interface SearchProviderMessageProps {
  pattern: string
  results: [string, DisplayResult[]][]
  error: Error | null
}

const SearchProviderMessage = memo(
  ({ pattern, results, error }: SearchProviderMessageProps) => {
    if (error) {
      return (
        <div style={style}>
          Error occurs when running <code>ast-grep</code>.<br />
          Make sure you{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/quick-start.html#installation">
            installed the binary
          </VSCodeLink>{' '}
          and the command <code>ast-grep</code> is accessible{' '}
          <VSCodeLink href="https://github.com/ast-grep/ast-grep-vscode/issues/133#issuecomment-1943153446">
            by your editor
          </VSCodeLink>
          .
        </div>
      )
    }
    const resultCount = results.reduce((a, l) => a + l[1].length, 0)
    const fileCount = results.length
    return (
      <>
        {resultCount === 0 ? (
          <Empty pattern={pattern} />
        ) : (
          <div
            style={style}
          >{`${resultCount} results in ${fileCount} files`}</div>
        )}
      </>
    )
  }
)

export default SearchProviderMessage
