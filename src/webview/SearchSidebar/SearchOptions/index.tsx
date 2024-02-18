import type { CSSProperties } from 'react'
import { VscEllipsis } from 'react-icons/vsc'
import { useBoolean } from 'react-use'

const buttonStyle: CSSProperties = {
  background: 'transparent',
  // TODO: add hover effect, may needs esbuild stylex
  // backgroundColor: 'var(--vscode-toolbar-hoverOutline)',
  color: 'var(--vscode-foreground)',
  cursor: 'pointer',
  width: 'auto',
  flex: '0 0 auto'
}

export default function SearchOptions() {
  const [showOptions, toggleOptions] = useBoolean(false)
  return (
    <div style={{ display: 'flex', justifyContent: 'end' }}>
      <button style={buttonStyle} onClick={toggleOptions}>
        <VscEllipsis />
      </button>
      {showOptions && <div>Options!</div>}
    </div>
  )
}
