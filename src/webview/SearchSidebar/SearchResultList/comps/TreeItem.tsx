import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { useBoolean } from 'react-use'
import type { DisplayResult } from '../../../../types'
import { CodeBlock } from './CodeBlock'
import { FileLink } from './FileLink'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import { memo } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  show: {
    display: 'flex'
  },
  hide: {
    display: 'none'
  },
  codeList: {
    flexDirection: 'column',
    // this wil make the scroll drop shadow
    ':before': {
      content: '""',
      position: 'sticky',
      display: 'block',
      height: 6,
      top: 22,
      left: 0,
      right: 0,
      boxShadow: 'var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset'
    }
  },
  codeItem: {
    flex: '1 0 100%',
    paddingLeft: '38px',
    listStyle: 'none',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    },
    ':first-child': {
      marginTop: -6
    }
  },
  treeItem: {
    position: 'relative',
    background: 'var(--vscode-sideBar-background)',
    // this will cover drop shadow if no scroll at all
    ':before': {
      content: '""',
      // absolute makes it only cover when no scroll
      // after scroll, cover will scroll up
      position: 'absolute',
      display: 'block',
      height: 6,
      top: 22,
      left: 0,
      right: 0,
      zIndex: 1,
      background: 'var(--vscode-sideBar-background)'
    },
    // tricky. compensate cover color for first item
    ':has( ul>:first-child:hover):before': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  },
  fileName: {
    position: 'sticky',
    zIndex: 1, // not occluded by cover
    top: 0,
    cursor: 'pointer',
    display: 'flex',
    paddingLeft: 8,
    paddingRight: 2,
    lineHeight: '22px',
    height: '22px',
    alignItems: 'center',
    background: 'var(--vscode-sideBar-background)',
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
    marginLeft: 'auto',
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
            {...stylex.props(styles.codeItem)}
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
        {...stylex.props(
          styles.codeList,
          isExpanded ? styles.show : styles.hide
        )}
      >
        <CodeBlockList matches={matches} />
      </ul>
    </div>
  )
}
export default TreeItem
