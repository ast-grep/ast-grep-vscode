import { FileLink } from './FileLink'
import { FileActions } from './Actions'
import type { DisplayResult } from '../../../types'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import * as stylex from '@stylexjs/stylex'
import { useHover } from 'react-use'
import { FC, memo } from 'react'
import { useStickyShadow } from './hooks'

const styles = stylex.create({
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
      background: 'var( --vscode-list-hoverBackground)',
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
export interface TreeHeaderProps {
  isExpanded: boolean
  toggleIsExpanded: () => void
  matches: DisplayResult[]
  isScrolled: boolean
}

const TreeHeader: FC<TreeHeaderProps> = ({
  isExpanded,
  toggleIsExpanded,
  matches,
  isScrolled,
}) => {
  const filePath = matches[0].file
  const hasReplace = Boolean(matches[0].replacement)
  const element = (hovered: boolean) => (
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
      {hovered ? (
        <FileActions filePath={filePath} hasReplace={hasReplace} />
      ) : (
        <VSCodeBadge {...stylex.props(styles.badge)}>
          {matches.length}
        </VSCodeBadge>
      )}
    </div>
  )
  const [hoverable] = useHover(element)
  return hoverable
}

export const ComposeTreeHeader: FC<
  Omit<TreeHeaderProps, 'isScrolled'> & {
    scrollContainerEl: HTMLElement | null
  }
> = ({
  isExpanded,

  scrollContainerEl,
  matches,
  toggleIsExpanded,
}) => {
  const { ref, isScrolled } = useStickyShadow(scrollContainerEl)
  console.log(isScrolled, 'isScrolled')
  return (
    <>
      <div className="scroll-observer" ref={ref} />
      <TreeHeader
        isExpanded={isExpanded}
        toggleIsExpanded={toggleIsExpanded}
        matches={matches}
        isScrolled={isScrolled}
      />
    </>
  )
}

export default memo(TreeHeader)
