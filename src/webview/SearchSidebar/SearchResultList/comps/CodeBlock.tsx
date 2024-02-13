import { Box } from '@chakra-ui/react'
import type { SgSearch } from '../../../../types'
import { openFile } from '../../postMessage'

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBackground)'
}

const LEADING_SPACES_RE = /^\s*/

function splitByHighLightToken(search: SgSearch) {
  const { start, end } = search.range
  let startIdx = start.column
  let endIdx = end.column
  let displayLine = search.lines
  // multiline matches! only display the first line!
  if (start.line < end.line) {
    displayLine = search.lines.split(/\r?\n/, 1)[0]
    endIdx = displayLine.length
  }
  // strip leading spaces
  const leadingSpaces = displayLine.match(LEADING_SPACES_RE)?.[0].length
  if (leadingSpaces) {
    displayLine = displayLine.substring(leadingSpaces)
    startIdx -= leadingSpaces
    endIdx -= leadingSpaces
  }
  return {
    index: [startIdx, endIdx],
    displayLine
  }
}

interface CodeBlockProps {
  match: SgSearch
}
export const CodeBlock = ({ match }: CodeBlockProps) => {
  const { file } = match
  const { index, displayLine } = splitByHighLightToken(match)

  const startIdx = index[0]
  const endIdx = index[1]
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
        openFile({ filePath: file, locationsToSelect: match.range })
      }}
    >
      {displayLine.slice(0, startIdx)}
      <span style={style}>{displayLine.slice(startIdx, endIdx)}</span>
      {displayLine.slice(endIdx)}
    </Box>
  )
}
