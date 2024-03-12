import TreeHeader from './TreeHeader'
import type { DisplayResult } from '../../../types'
import { MatchList } from './MatchList'
import { memo } from 'react'
import { useToggleResult, useStickyShadow } from './useListState'
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

interface TreeItemProps {
  className: string
  matches: DisplayResult[]
}

const TreeItem = ({ className, matches }: TreeItemProps) => {
  const filePath = matches[0].file
  const [isExpanded, toggleIsExpanded] = useToggleResult(filePath)
  const { isScrolled, ref } = useStickyShadow(filePath)
  const props = stylex.props(styles.treeItem)

  return (
    <div className={`${className} ${props.className}`} style={props.style}>
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
