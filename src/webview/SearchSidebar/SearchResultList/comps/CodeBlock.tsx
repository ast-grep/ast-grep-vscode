import { Box } from '@chakra-ui/react'
import type { DisplayResult } from '../../../../types'
import { openFile } from '../../../postMessage'

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBorder)'
}

// this is also hardcoded in vscode
const lineIndicatorStyle = {
  margin: '0 7px 4px',
  opacity: '0.7',
  fontSize: '0.9em',
  verticalAlign: 'bottom'
}

function MultiLineIndicator({ lineSpan }: { lineSpan: number }) {
  if (lineSpan <= 0) {
    return null
  }
  return <span style={lineIndicatorStyle}>+{lineSpan}</span>
}

interface CodeBlockProps {
  match: DisplayResult
}
export const CodeBlock = ({ match }: CodeBlockProps) => {
  const { startIdx, endIdx, displayLine, lineSpan } = match

  return (
    <Box
      flex="1"
      textOverflow="ellipsis"
      overflow="hidden"
      whiteSpace="pre"
      fontSize="13px"
      lineHeight="22px"
      height="22px"
      cursor="pointer"
      onClick={() => {
        openFile({ filePath: match.file, locationsToSelect: match.range })
      }}
    >
      <MultiLineIndicator lineSpan={lineSpan} />
      {displayLine.slice(0, startIdx)}
      <span style={style}>{displayLine.slice(startIdx, endIdx)}</span>
      {displayLine.slice(endIdx)}
    </Box>
  )
}
