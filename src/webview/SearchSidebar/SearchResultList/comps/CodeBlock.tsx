import { Box } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import type { SgSearch } from '../../../../types'
import { openFile } from '../../postMessage'

type HighLightToken = {
  start: {
    line: number
    column: number
  }
  end: {
    line: number
    column: number
  }
  style: React.CSSProperties
}

function splitByHighLightTokens(tokens: HighLightToken[]) {
  const codeSegments = tokens
    .map(({ start, end, style }) => {
      // TODO: multilines highlight
      const { column: startColumn } = start
      const { column: endColumn } = end

      const startIdx = startColumn
      const endIdx = endColumn

      return {
        range: [startIdx, endIdx],
        style
      }
    })
    .sort((a, b) => a.range[0] - b.range[0])

  return codeSegments
}

interface CodeBlockProps {
  match: SgSearch
}
export const CodeBlock = ({ match }: CodeBlockProps) => {
  const { file, lines, range } = match
  const matchHighlight = [
    {
      start: {
        line: range.start.line,
        column: range.start.column
      },
      end: {
        line: range.end.line,
        column: range.end.column
      },
      style: {
        backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
        border: '1px solid var(--vscode-editor-findMatchHighlightBackground)'
      }
    }
  ]

  const codeSegments = useMemo(() => {
    return splitByHighLightTokens(matchHighlight)
  }, [lines, matchHighlight])

  if (codeSegments.length === 0) {
    return (
      <Box
        flex="1"
        textOverflow="ellipsis"
        overflow="hidden"
        whiteSpace="pre"
        fontSize="13px"
        lineHeight="22px"
        height="22px"
      >
        {lines}
      </Box>
    )
  }

  const highlightStartIdx = codeSegments[0].range[0]
  const highlightEndIdx = codeSegments[codeSegments.length - 1].range[1]
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
      {highlightStartIdx <= 0 ? '' : lines.slice(0, highlightStartIdx)}
      {codeSegments.map(({ range, style }) => {
        const [start, end] = range
        return (
          <span style={style} key={`${start}-${end}`}>
            {lines.slice(start, end)}
          </span>
        )
      })}
      {highlightEndIdx >= lines.length ? '' : lines.slice(highlightEndIdx)}
    </Box>
  )
}
