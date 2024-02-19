import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { useBoolean } from 'react-use'
import type { DisplayResult } from '../../../../types'
import { CodeBlock } from './CodeBlock'
import { FileLink } from './FileLink'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import { memo, useEffect, useRef } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  show: {
    display: 'flex'
  },
  hide: {
    display: 'none'
  },
  codeList: {
    flexDirection: 'column'
  },
  codeItem: {
    flex: '1 0 100%',
    paddingLeft: '38px',
    listStyle: 'none',
    ':hover': {
      background: 'var(--vscode-list-inactiveSelectionBackground)'
    }
  },
  treeItem: {
    position: 'relative',
    background: 'var(--vscode-sideBar-background)'
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
  scrolled: {
    boxShadow: 'var(--vscode-scrollbar-shadow) 0 0 6px'
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

function useStickyShadow() {
  const [isScrolled, setScrolled] = useBoolean(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setScrolled(false)
      } else {
        setScrolled(true)
      }
    })
    observer.observe(ref.current!)
    return () => {
      observer.disconnect()
    }
  })
  return {
    isScrolled,
    ref
  }
}

interface TreeItemProps {
  filePath: string
  matches: DisplayResult[]
}

const TreeItem = ({ filePath, matches }: TreeItemProps) => {
  const [isExpanded, toggleIsExpanded] = useBoolean(true)
  const { isScrolled, ref } = useStickyShadow()

  return (
    <div {...stylex.props(styles.treeItem)}>
      <div className="scroll-observer" ref={ref} />
      <div
        {...stylex.props(styles.fileName, isScrolled && styles.scrolled)}
        onClick={toggleIsExpanded}
      >
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
