import { useThemeType } from '../hooks/useThemeType'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import { DoubleClickButton } from './DoubleClickButton'
import { usePreventScrollJump } from './usePreventScrollJump'
import { groupHeaderHeight, getIconButtonProps, getBorderColor } from './utils'
import { Flex, IconButton } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'

type WorkspaceGroupProps = {
  allCount: number
  workspace: string
  removeWorkspace: (workspace: string) => void
  children: React.ReactNode
  scrollElRef: React.MutableRefObject<HTMLDivElement | null>
}

export function WorkspaceGroup({
  allCount,
  workspace,
  removeWorkspace,
  children,
  scrollElRef
}: WorkspaceGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

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
  const borderColor = getBorderColor(isDarkTheme, false, highlightTheme)

  return (
    <Flex key={workspace} flexDir="column" ref={wrapperRef}>
      <Flex
        position="sticky"
        top="0px"
        backgroundColor="var(--vscode-editor-background)"
        zIndex="2"
        px="1"
        border="1px solid"
        borderColor={borderColor}
        height={groupHeaderHeight}
        alignItems="center"
        ref={headingRef}
        maxWidth="100%"
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
        <Flex ml="2" mr="auto" maxWidth="calc(100% - 110px)">
          {workspace}
        </Flex>
        <Flex>({allCount})</Flex>
        {/* <DoubleClickButton
          iconButton
          icon={<IoMdClose />}
          confirmText="Click again to remove"
          {...iconButtonStyleResetProps}
          onClick={e => {
            e.stopPropagation()
            preventScrollJump()
            removeWorkspace(workspace)
          }}
          ml="3"
          borderRadius="md"
          tooltipPlacement="bottom-end"
        /> */}
      </Flex>
      <Flex
        width="100%"
        flexDir="column"
        gap="4"
        display={isExpanded ? 'flex' : 'none'}
      >
        {children}
      </Flex>
    </Flex>
  )
}
