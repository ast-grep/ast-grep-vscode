import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'
import { memo } from 'react'
import type { DisplayResult, SearchQuery } from '../../../types'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '0 22px 8px',
  lineHeight: '1.4em',
}

const ulStyle = {
  listStyle: 'inside',
  listStyleType: '"- "',
  marginTop: '6px',
  overflowWrap: 'break-word',
} as const

const codeStyle = {
  fontSize: 'var(--vscode-font-size)',
} as const

function Empty({ query }: { query: SearchQuery }) {
  const { pattern, includeFile } = query
  if (!pattern) {
    return null
  }
  return (
    <div style={style}>
      No results found for <code style={codeStyle}>{pattern}</code>
      {includeFile ? ` in '${includeFile}'` : null}.
      <br />
      If this is unexpected, you can try:
      <ul style={ulStyle}>
        <li>
          Ensure the query follows the{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
            Pattern Syntax
          </VSCodeLink>
        </li>
        <li>
          Check if the file types are{' '}
          <VSCodeLink href="https://ast-grep.github.io/reference/languages.html">
            supported
          </VSCodeLink>
        </li>
        {query.lang ?
          (
            <li>
              Remove language filter <code style={codeStyle}>{query.lang}</code>{' '}
              and search in all files.
            </li>
          ) :
          null}
        {query.strictness !== 'smart' ?
          (
            <li>
              Adjust pattern{' '}
              <VSCodeLink href="https://ast-grep.github.io/reference/cli/run.html#no-ignore-file-type">
                strictness
              </VSCodeLink>
              .
            </li>
          ) :
          null}
        {query.selector ?
          (
            <li>
              Ensure pattern{' '}
              <VSCodeLink href="https://ast-grep.github.io/guide/rule-config/atomic-rule.html#pattern">
                selector
              </VSCodeLink>{' '}
              is valid. Debug in
              <VSCodeLink href="https://ast-grep.github.io/playground.html">
                Playground
              </VSCodeLink>
              .
            </li>
          ) :
          null}
        {query.includeFile.length ?
          (
            <li>
              glob patterns requires ast-grep <code style={codeStyle}>v0.28.0</code>+.
            </li>
          ) :
          null}
        <li>
          Adjust your gitignore files.{' '}
          <VSCodeLink href="https://ast-grep.github.io/reference/cli/run.html#no-ignore-file-type">
            See doc
          </VSCodeLink>
        </li>
      </ul>
    </div>
  )
}

interface SearchProviderMessageProps {
  query: SearchQuery
  results: [string, DisplayResult[]][]
  error: Error | null
}

const SearchProviderMessage = memo(
  ({ query, results, error }: SearchProviderMessageProps) => {
    if (error) {
      return (
        <div style={style}>
          Error occurs when running <code style={codeStyle}>ast-grep</code>.
          <br />
          Make sure you{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/quick-start.html#installation">
            installed the binary
          </VSCodeLink>{' '}
          and the command <code style={codeStyle}>ast-grep</code> is accessible{' '}
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
        {resultCount === 0 ? <Empty query={query} /> : (
          <div
            style={style}
          >
            {`${resultCount} results in ${fileCount} files`}
          </div>
        )}
      </>
    )
  },
)

export default SearchProviderMessage
