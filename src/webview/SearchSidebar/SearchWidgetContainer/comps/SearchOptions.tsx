import type { CSSProperties } from 'react'
import { VscEllipsis } from 'react-icons/vsc'
import { useBoolean } from 'react-use'
import IncludeFile from './IncludeFile'

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
  flex: '0 0 auto',
  position: 'absolute',
  top: '0',
  right: '0'
}
const optionsStyle: CSSProperties = {
  minHeight: '16px',
  marginLeft: '18px',
  position: 'relative'
}

export default function SearchOptions() {
  const [showOptions, toggleOptions] = useBoolean(false)
  return (
    <div style={optionsStyle}>
      <button style={buttonStyle} onClick={toggleOptions}>
        <VscEllipsis />
      </button>
      {showOptions && (
        <div style={{ paddingBottom: '4px' }}>
          <IncludeFile />
          {/* TODO: add file include*/}
        </div>
      )}
    </div>
  )
}
