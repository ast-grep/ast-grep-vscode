import { HStack, IconButton, VStack } from '@chakra-ui/react'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { useBoolean } from 'react-use'
import type { DisplayResult } from '../../../../types'
import { CodeBlock } from './CodeBlock'
import { FileLink } from './FileLink'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import { memo } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  oneItem: {
    width: '100%',
    paddingLeft: '20px',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  }
})

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
          <div
            {...stylex.props(styles.oneItem)}
            key={file + byteOffset.start + byteOffset.end}
          >
            <CodeBlock match={match} />
          </div>
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
          icon={isExpanded ? <VscChevronDown /> : <VscChevronRight />}
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
