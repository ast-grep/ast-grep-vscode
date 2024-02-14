import { memo } from 'react'
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '6px 22px 8px',
  lineHeight: '1.4em'
}

const ulStyle = {
  listStyle: 'inside',
  listStyleType: '"- "',
  marginTop: '6px',
  overflowWrap: 'break-word'
} as const

const Empty = memo(({ pattern }: { pattern: string }) => {
  if (!pattern) {
    return null
  }
  return (
    <div style={style}>
      No results found for <code>{pattern}</code>. If this is not expected, you
      can try:
      <ul style={ulStyle}>
        <li>
          Make sure your query follows the{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
            Pattern Syntax
          </VSCodeLink>
          .
        </li>
        <li>
          Check if the file type is one of the{' '}
          <VSCodeLink href="https://ast-grep.github.io/reference/languages.html">
            Supported Languages
          </VSCodeLink>
          .
        </li>
        {/*
        <li>
          Adjust your gitignore files. {' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/pattern-syntax.html">
            Open Settings.
          </VSCodeLink>
        </li>
        */}
      </ul>
    </div>
  )
})

interface SearchProviderMessageProps {
  resultCount: number
  fileCount: number
  pattern: string
}

const SearchProviderMessage = ({
  pattern,
  resultCount,
  fileCount
}: SearchProviderMessageProps) => {
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

export default SearchProviderMessage
