import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { useBoolean } from 'react-use'
import type { DisplayResult } from '../../../types'
import { FileLink } from './FileLink'
import { MatchList } from './MatchList'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import { memo, useEffect, useRef } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  treeItem: {
    position: 'relative',
    background: 'var(--vscode-sideBar-background)',
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
      background: 'var(--vscode-list-inactiveSelectionBackground)',
    },
  },
  scrolled: {
    boxShadow: 'var(--vscode-scrollbar-shadow) 0 0 6px',
  },
  toggleButton: {
    flex: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'var(--vscode-foreground)',
    paddingRight: '4px',
  },
  badge: {
    marginLeft: 'auto',
    flex: '0 0 auto',
  },
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
    ref,
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
      <ul style={{ display: isExpanded ? '' : 'none' }}>
        <MatchList matches={matches} />
      </ul>
    </div>
  )
}
export default memo(TreeItem)
