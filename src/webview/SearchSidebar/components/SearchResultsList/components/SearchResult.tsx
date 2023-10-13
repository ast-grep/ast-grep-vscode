import { Checkbox, Flex, IconButton } from '@chakra-ui/react'
// import { MatchWithFileInfo } from '@codeque/core'
import { memo, useEffect, useRef, useState } from 'react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'
import { CodeBlock } from './CodeBlock'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import { DoubleClickButton } from './DoubleClickButton'
import { useThemeType } from '../hooks/useThemeType'
import { CopyPath } from './CopyPath'
import { FileLink } from './FileLink'
import { usePreventScrollJump } from './usePreventScrollJump'
import { getBorderColor, getIconButtonProps, groupHeaderHeight } from './utils'
import { MatchWithFileInfo } from '../types'

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
      {/* <Flex
        alignItems="center"
        px="1"
        position="sticky"
        top={`calc(${hasGroup ? groupHeaderHeight : '0px'} + ${
          hasWorkspace ? groupHeaderHeight : '0px'
        })`}
        border="1px solid"
        borderColor={borderColor}
        transition="border 0.3s ease-in-out"
        backgroundColor="var(--vscode-editor-background)"
        maxWidth="100%"
        ref={headingRef}
        height={groupHeaderHeight}
      >
        <IconButton
          onClick={() => {
            if (isExpanded) {
              preventScrollJump()
            }

            setIsExpanded(!isExpanded)
          }}
          aria-label="expand/collapse button"
          icon={
            isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />
          }
          {...iconButtonStyleResetProps}
          mr="2"
        />
        <FileLink
          match={match}
          relativeFilePath={relativeFilePath}
          onClick={() => {
            setIsResultFocused(true)
          }}
          matchStartCol={matchStartCol}
          matchStartLine={matchStartLine}
          maxWidth="calc(100% - 150px)"
        />
        <Flex ml="2" mr="auto">
          <CopyPath fullFilePath={fullFilePath} />
        </Flex>
        <Checkbox
          ml="3"
          isChecked={isChecked}
          onChange={(ev) => {
            const checked = ev.target.checked // changed to checked

            if (checked) {
              preventScrollJump()
            }

            setIsChecked(checked)
            setIsExpanded(!checked)
          }}
        >
          Done
        </Checkbox>
        <DoubleClickButton
          iconButton
          icon={<IoMdClose />}
          confirmText="Click again to remove"
          {...iconButtonStyleResetProps}
          onClick={(e) => {
            e.stopPropagation()
            preventScrollJump()
            removeMatch(match.filePath, match.start, match.end)
          }}
          ml="3"
          borderRadius="md"
          tooltipPlacement="bottom-end"
        />
      </Flex> */}
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
