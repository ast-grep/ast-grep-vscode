import { Box } from '@chakra-ui/react'
import type { SgSearch } from '../../../../types'
import { openFile } from '../../postMessage'

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBackground)'
}

function splitByHighLightToken(search: SgSearch) {
  const { start, end } = search.range
  let startIdx = start.column
  let endIdx = end.column
  let displayLine = search.lines
  // multiline matches!
  if (start.line < end.line) {
    displayLine = search.lines.split(/\r?\n/, 1)[0]
    endIdx = displayLine.length
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
  const { file, lines } = match

  const { index } = splitByHighLightToken(match)

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
      {startIdx <= 0 ? '' : lines.slice(0, startIdx)}
      <span style={style}>{lines.slice(startIdx, endIdx)}</span>
      {endIdx >= lines.length ? '' : lines.slice(endIdx)}
    </Box>
  )
}
