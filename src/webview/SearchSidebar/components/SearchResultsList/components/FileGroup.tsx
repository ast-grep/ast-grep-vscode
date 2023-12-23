import { useThemeType } from '../hooks/useThemeType'
import { MatchWithFileInfo } from '../types'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import { FileLink } from './FileLink'
import { SearchResult } from './SearchResult'
import { usePreventScrollJump } from './usePreventScrollJump'
import { getIconButtonProps, groupHeaderHeight } from './utils'
import { Flex, IconButton } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'

type FileGroupProps = {
  matches: MatchWithFileInfo[]
  filePath: string
  getRelativePath: (filePath: string) => string | undefined
  removeMatch: (filePath: string, start: number, end: number) => void
  removeFile: (filePath: string) => void
  hasWorkspace: boolean
  scrollElRef: React.MutableRefObject<HTMLDivElement | null>
}

export function FileGroup({
  matches,
  getRelativePath,
  filePath,
  removeMatch,
  removeFile,
  hasWorkspace,
  scrollElRef
}: FileGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  // const [isResultFocused, setIsResultFocused] = useState(false)

  const preventScrollJump = usePreventScrollJump(
    wrapperRef,
    headingRef,
    scrollElRef
  )

  const themeType = useThemeType()
  const isDarkTheme = themeType === 'dark'
  const highlightTheme = isDarkTheme ? darkTheme : lightTheme

  const iconButtonStyleResetProps = getIconButtonProps(
    highlightTheme.plain.backgroundColor
  )

  const relativeFilePath = getRelativePath(filePath) ?? ''
  // const borderColor = getBorderColor(
  //   isDarkTheme,
  //   isResultFocused,
  //   highlightTheme
  // )

  // useEffect(() => {
  //   const handleWindowFocus = () => {
  //     // setIsResultFocused(false)
  //   }

  //   window.addEventListener('focus', handleWindowFocus)

  //   return () => {
  //     window.removeEventListener('focus', handleWindowFocus)
  //   }
  // }, [])

  return (
    <Flex
      key={filePath}
      width="100%"
      flexDir="column"
      ref={wrapperRef}
      pl={hasWorkspace ? '4' : '0'}
    >
      <Flex
        position="sticky"
        top={hasWorkspace ? groupHeaderHeight : '0px'}
        backgroundColor="var(--vscode-editor-background)"
        transition="border 0.3s ease-in-out"
        zIndex="1"
        px="1"
        height={groupHeaderHeight}
        alignItems="center"
        ref={headingRef}
        maxWidth="100%"
      >
        <IconButton
          variant="customIconButton"
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
          match={{
            filePath
          }}
          relativeFilePath={relativeFilePath}
          onClick={() => {
            // setIsResultFocused(true)
          }}
          maxWidth="100%"
        />
        {/* <Flex ml="2" mr="auto">
          <CopyPath fullFilePath={relativeFilePath} />
        </Flex> */}
        <Flex ml="2">({matches.length})</Flex>
      </Flex>
      <Flex
        width="100%"
        flexDir="column"
        gap="4"
        display={isExpanded ? 'flex' : 'none'}
      >
        {matches.map(match => {
          const key = `${match.filePath}-${match.start}-${match.end}-${match.code}-${match.loc.start}-${match.loc.end}`

          return (
            <SearchResult
              key={key}
              match={match}
              getRelativePath={getRelativePath}
              removeMatch={removeMatch}
              hasGroup={true}
              hasWorkspace={hasWorkspace}
              scrollElRef={scrollElRef}
            />
          )
        })}
      </Flex>
    </Flex>
  )
}
