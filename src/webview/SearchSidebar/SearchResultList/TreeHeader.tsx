import { FileLink } from './FileLink'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import * as stylex from '@stylexjs/stylex'

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
interface TreeHeaderProps {
  filePath: string
  isExpanded: boolean
  toggleIsExpanded: () => void
  matchCount: number
  isScrolled: boolean
}

export default function TreeHeader({
  filePath,
  isExpanded,
  toggleIsExpanded,
  matchCount,
  isScrolled,
}: TreeHeaderProps) {
  return (
    <>
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
        <VSCodeBadge {...stylex.props(styles.badge)}>{matchCount}</VSCodeBadge>
      </div>
    </>
  )
}
