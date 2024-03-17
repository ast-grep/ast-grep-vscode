import { FileLink } from './FileLink'
import { FileActions } from './Actions'
import type { DisplayResult } from '../../../types'
import { useActiveItem } from './useListState'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import * as stylex from '@stylexjs/stylex'
import { useHover } from 'react-use'
import { useCallback } from 'react'

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
  active: {
    background: 'var(--vscode-list-activeSelectionBackground)',
    outline:
      '1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))',
    outlineOffset: -1,
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
interface TreeHeaderProps {
  isExpanded: boolean
  toggleIsExpanded: () => void
  matches: DisplayResult[]
  isScrolled: boolean
}

export default function TreeHeader({
  isExpanded,
  toggleIsExpanded,
  matches,
  isScrolled,
}: TreeHeaderProps) {
  const filePath = matches[0].file
  const hasReplace = Boolean(matches[0].replacement)
  const [active, setActive] = useActiveItem(matches)
  const styleProps = stylex.props(
    styles.fileName,
    isScrolled && styles.scrolled,
    active && styles.active,
  )
  const onClick = useCallback(() => {
    toggleIsExpanded()
    setActive()
  }, [toggleIsExpanded, setActive])
  const element = (hovered: boolean) => (
    <div {...styleProps} onClick={onClick}>
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
