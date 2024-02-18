import type { CSSProperties } from 'react'
import { VscEllipsis } from 'react-icons/vsc'
import { useBoolean } from 'react-use'

const buttonStyle: CSSProperties = {
  background: 'transparent',
  // TODO: add hover effect, may needs esbuild stylex
  // backgroundColor: 'var(--vscode-toolbar-hoverOutline)',
  color: 'var(--vscode-foreground)',
  cursor: 'pointer',
  width: 'fit-content',
  alignSelf: 'end',
  textAlign: 'end',
  padding: '0 4px',
  height: '16px',
  flex: '0 0 auto'
}
const optionsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '1em',
  marginLeft: '18px'
}

export default function SearchOptions() {
  const [showOptions, toggleOptions] = useBoolean(false)
  return (
    <div style={optionsStyle}>
      <button style={buttonStyle} onClick={toggleOptions}>
        <VscEllipsis />
      </button>
      {showOptions && <div>Options!</div>}
    </div>
  )
}
