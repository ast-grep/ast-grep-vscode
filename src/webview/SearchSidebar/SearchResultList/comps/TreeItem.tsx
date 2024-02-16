import { HStack, IconButton, VStack, Box } from '@chakra-ui/react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { useBoolean } from 'react-use'
import type { DisplayResult } from '../../../../types'
import { CodeBlock } from './CodeBlock'
import { FileLink } from './FileLink'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import { memo } from 'react'

interface CodeBlockListProps {
  matches: DisplayResult[]
}

const CodeBlockList = memo(({ matches }: CodeBlockListProps) => {
  return (
    <>
      {matches?.map(match => {
        const { file, range } = match
        const { byteOffset } = range
        return (
          <HStack
            w="100%"
            justifyContent="flex-start"
            key={file + byteOffset.start + byteOffset.end}
            _hover={{
              background: 'var(--vscode-list-inactiveSelectionBackground)'
            }}
          >
            <Box w="20px" />
            <CodeBlock match={match} />
          </HStack>
        )
      })}
    </>
  )
})

interface TreeItemProps {
  filePath: string
  matches: DisplayResult[]
}

const TreeItem = ({ filePath, matches }: TreeItemProps) => {
  const [isExpanded, toggleIsExpanded] = useBoolean(true)

  return (
    <VStack w="100%" pl="10" p="2" gap="0">
      <HStack
        w="100%"
        onClick={toggleIsExpanded}
        cursor="pointer"
        _hover={{
          background: 'var(--vscode-list-inactiveSelectionBackground)'
        }}
      >
        <IconButton
          flex={0}
          color="var(--vscode-foreground)"
          background="transparent"
          aria-label="expand/collapse button"
          pointerEvents="none"
          icon={
            isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />
          }
          mr="2"
        />
        <HStack
          flex={1}
          gap="4"
          px="2"
          alignItems="center"
          justifyContent="space-between"
          h="22px"
          lineHeight="22px"
        >
          <FileLink filePath={filePath} />
          <VSCodeBadge>{matches.length}</VSCodeBadge>
        </HStack>
      </HStack>

      <VStack
        w="100%"
        alignItems="flex-start"
        gap="0"
        display={isExpanded ? 'flex' : 'none'}
      >
        <CodeBlockList matches={matches} />
      </VStack>
    </VStack>
  )
}
export default TreeItem
