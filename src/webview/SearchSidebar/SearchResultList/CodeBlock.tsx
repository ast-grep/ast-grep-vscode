import * as stylex from '@stylexjs/stylex'
import { memo, useCallback } from 'react'
import type { DisplayResult } from '../../../types'
import { openAction } from '../../hooks/useSearch'

const styles = stylex.create({
  box: {
    flex: '1',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'pre',
    fontSize: '13px',
    lineHeight: '22px',
    height: '22px',
    cursor: 'pointer',
  },
  deleted: {
    textDecoration: 'line-through',
    backgroundColor: 'var(--vscode-diffEditor-removedTextBackground)',
    border: '1px solid var(--vscode-diffEditor-removedTextBackground)',
  },
  inserted: {
    backgroundColor: 'var(--vscode-diffEditor-insertedTextBackground)',
    ':not(:empty)': {
      border: '1px solid var(--vscode-diffEditor-insertedLineBackground)',
    },
  },
})

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBorder)',
}

// this is also hardcoded in vscode
const lineIndicatorStyle = {
  margin: '0 7px 4px',
  opacity: '0.7',
  fontSize: '0.9em',
  verticalAlign: 'bottom',
}

function MultiLineIndicator({ lineSpan }: { lineSpan: number }) {
  if (lineSpan <= 0) {
    return null
  }
  return <span style={lineIndicatorStyle}>+{lineSpan}</span>
}

function Highlight({
  displayLine,
  startIdx,
  endIdx,
  replacement,
}: DisplayResult) {
  const matched = displayLine.slice(startIdx, endIdx)
  if (replacement) {
    const displayDiff = replacement.split(/\r?\n/, 1)[0]
    return (
      <>
        <span {...stylex.props(styles.deleted)}>{matched}</span>
        <span {...stylex.props(styles.inserted)}>{displayDiff}</span>
      </>
    )
  }
  return <span style={style}>{matched}</span>
}

interface CodeBlockProps {
  match: DisplayResult
}
export const CodeBlock = memo(({ match }: CodeBlockProps) => {
  const { startIdx, endIdx, displayLine, lineSpan, file, range } = match
  const onClick = useCallback(() => {
    openAction({ filePath: file, locationsToSelect: range })
  }, [file, range])

  return (
    <div {...stylex.props(styles.box)} onClick={onClick}>
      <MultiLineIndicator lineSpan={lineSpan} />
      {displayLine.slice(0, startIdx)}
      <Highlight {...match} />
      {displayLine.slice(endIdx)}
    </div>
  )
})
