import { Box } from '@chakra-ui/react'
import type { SgSearch } from '../../../../types'
import { openFile } from '../../postMessage'

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBackground)'
}

function splitByHighLightToken(search: SgSearch) {
  const { start, end } = search.range
  // TODO: multilines highlight
  const { column: startColumn } = start
  const { column: endColumn } = end

  const startIdx = startColumn
  const endIdx = endColumn

  return {
    index: [startIdx, endIdx]
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
