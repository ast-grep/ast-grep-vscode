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
  codeList: {
    width: '100%',
    paddingLeft: '20px',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  },
  treeItem: {
    padding: '2px 2px 2px 10px'
  },
  fileName: {
    cursor: 'pointer',
    display: 'flex',
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
            {...stylex.props(styles.codeList)}
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
    <div {...stylex.props(styles.treeItem)}>
      <div {...stylex.props(styles.fileName)} onClick={toggleIsExpanded}>
        <IconButton
          flex={0}
          color="var(--vscode-foreground)"
          background="transparent"
          pointerEvents="none"
          aria-label="expand/collapse button"
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
      </div>
      <VStack
        w="100%"
        alignItems="flex-start"
        gap="0"
        display={isExpanded ? 'flex' : 'none'}
      >
        <CodeBlockList matches={matches} />
      </VStack>
    </div>
  )
}
export default TreeItem
