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
    flex: '1 0 100%',
    paddingLeft: '20px',
    listStyle: 'none',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  },
  treeItem: {
    padding: '0 2px 0 10px'
  },
  fileName: {
    cursor: 'pointer',
    display: 'flex',
    lineHeight: '22px',
    height: '22px',
    alignItems: 'center',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  },
  toggleButton: {
    flex: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'var(--vscode-foreground)',
    paddingRight: '4px'
  },
  badge: {
    margin: '0 2px 0 auto',
    flex: '0 0 auto'
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
          <li
            {...stylex.props(styles.codeList)}
            key={file + byteOffset.start + byteOffset.end}
          >
            <CodeBlock match={match} />
          </li>
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
        <div
          {...stylex.props(styles.toggleButton)}
          aria-label="expand/collapse button"
          role="button"
        >
          {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
        </div>
        <FileLink filePath={filePath} />
        <VSCodeBadge {...stylex.props(styles.badge)}>
          {matches.length}
        </VSCodeBadge>
      </div>
      <ul
        style={{
          display: isExpanded ? 'flex' : 'none',
          flexDirection: 'column'
        }}
      >
        <CodeBlockList matches={matches} />
      </ul>
    </div>
  )
}
export default TreeItem
