import { useThemeType } from '../hooks/useThemeType'
import { MatchWithFileInfo } from '../types'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import { CodeBlock } from './CodeBlock'
import { usePreventScrollJump } from './usePreventScrollJump'
import { getBorderColor, getIconButtonProps } from './utils'
import { Flex } from '@chakra-ui/react'
import { memo, useEffect, useRef, useState } from 'react'

type SearchResultProps = {
  match: MatchWithFileInfo
  getRelativePath: (filePath: string) => string | undefined
  removeMatch: (filePath: string, start: number, end: number) => void
  hasGroup: boolean
  hasWorkspace: boolean
  scrollElRef: React.MutableRefObject<HTMLDivElement | null>
}

const highlightColorOnLight = '#ddebf2'

const highlightColorOnDark = '#35485b'

const getMatchHighlightStyle = (isDark: boolean) => {
  const highlightColor = isDark ? highlightColorOnDark : highlightColorOnLight

  return {
    backgroundColor: highlightColor,
    boxShadow: `0px 5px 0px ${highlightColor}, 0px -5px 0px ${highlightColor}`
  }
}

const removeWhiteSpaces = (str: string) => str.replace(/\s+/g, '')

const getFileExtension = (filePath: string) =>
  filePath.match(/(?<=(\.))(\w)+$/g)?.[0]

export const SearchResult = memo(function SearchResult({
  match,
  getRelativePath,
  removeMatch,
  hasGroup,
  hasWorkspace,
  scrollElRef
}: SearchResultProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  const [isExpanded, setIsExpanded] = useState(true)
  const [isChecked, setIsChecked] = useState(false)
  const [isResultFocused, setIsResultFocused] = useState(false)

  const relativeFilePath = getRelativePath(match.filePath)
  const matchStartLine = match.loc.start.line
  // Vscode columns are indexed from 1, while result is indexed from 0
  const matchStartCol = match.loc.start.column + 1
  const fullFilePath = `${relativeFilePath}:${matchStartLine}:${matchStartCol}`
  const themeType = useThemeType()
  const isDarkTheme = themeType === 'dark'
  const highlightTheme = isDarkTheme ? darkTheme : lightTheme

  const borderColor = getBorderColor(
    isDarkTheme,
    isResultFocused,
    highlightTheme
  )

  const iconButtonStyleResetProps = getIconButtonProps(
    highlightTheme.plain.backgroundColor
  )

  useEffect(() => {
    const handleWindowFocus = () => {
      setIsResultFocused(false)
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  const extendedCodeFrame = match.extendedCodeFrame
  const extendedCodeFrameCode = extendedCodeFrame.code

  const initialWhitespaceSequenceMatch = extendedCodeFrameCode.match(/^\s*/g)

  const initialWhitespaceSequence =
    initialWhitespaceSequenceMatch !== null
      ? initialWhitespaceSequenceMatch[0]
      : ''

  const containsInitialWhitespace = initialWhitespaceSequence.length > 0

  const shouldDedentResult =
    containsInitialWhitespace &&
    (extendedCodeFrame.startLine as number) >= match.loc.start.line

  const highlightColumnChangeDueToDedent = shouldDedentResult
    ? initialWhitespaceSequence.length
    : 0

  const matchHighlight = [
    {
      start: {
        line: match.loc.start.line,
        column: match.loc.start.column - highlightColumnChangeDueToDedent
      },
      end: {
        line: match.loc.end.line,
        column: match.loc.end.column - highlightColumnChangeDueToDedent
      },
      style: getMatchHighlightStyle(isDarkTheme)
    }
  ]

  const preventScrollJump = usePreventScrollJump(
    wrapperRef,
    headingRef,
    scrollElRef
  )

  const fileExtension = getFileExtension(match.filePath)

  return (
    <Flex flexDir="column" width="100%" pl={'4'} ref={wrapperRef}>
      {isExpanded ? (
        <Flex
          padding="5"
          background={highlightTheme.plain.backgroundColor}
          overflowX="auto"
          border={themeType !== 'dark' ? '1px solid' : ''}
          borderTopWidth={0}
          borderColor="gray.300"
        >
          <CodeBlock
            startLineNumber={extendedCodeFrame.startLine}
            theme={highlightTheme}
            dedent={shouldDedentResult}
            customHighlight={matchHighlight}
            fileExtension={fileExtension}
          >
            {/**
             * replacing tabs with spaces fixes match highligh and improves code formatting
             */}
            {shouldDedentResult
              ? extendedCodeFrameCode.replace(/\t/g, ' '.repeat(4))
              : extendedCodeFrameCode}
          </CodeBlock>
        </Flex>
      ) : null}
    </Flex>
  )
})
