import { useBoolean } from 'react-use'
import TreeHeader from './TreeHeader'
import type { DisplayResult } from '../../../types'
import { MatchList } from './MatchList'
import { memo, useEffect, useRef } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  treeItem: {
    position: 'relative',
    background: 'var(--vscode-sideBar-background)',
    '::before': {
      content: '',
      display: 'block',
      position: 'absolute',
      top: '22px',
      bottom: 0,
      left: '13px', // left 16px - translateX 3px
      width: '1px',
      backgroundColor: 'var(--vscode-tree-inactiveIndentGuidesStroke)',
      transition: '0.1s opacity linear',
    },
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
      <TreeHeader
        isExpanded={isExpanded}
        toggleIsExpanded={toggleIsExpanded}
        matches={matches}
        isScrolled={isScrolled}
      />
      <ul style={{ display: isExpanded ? '' : 'none' }}>
        <MatchList matches={matches} />
      </ul>
    </div>
  )
}
export default memo(TreeItem)
