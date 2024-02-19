import type { CSSProperties } from 'react'
import { VscEllipsis } from 'react-icons/vsc'
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
  right: '-2px'
}
const optionsStyle: CSSProperties = {
  minHeight: '16px',
  marginLeft: '18px',
  position: 'relative'
}

interface SearchOptionsProps {
  includeFile: string
  setIncludeFile: (value: string) => void
  refreshResult: () => void
  showOptions: boolean
  toggleOptions: () => void
}

export default function SearchOptions({
  includeFile,
  setIncludeFile,
  refreshResult,
  showOptions,
  toggleOptions
}: SearchOptionsProps) {
  return (
    <div style={optionsStyle}>
      <button style={buttonStyle} onClick={toggleOptions}>
        <VscEllipsis />
      </button>
      {showOptions && (
        <div style={{ paddingBottom: '6px' }}>
          <IncludeFile
            includeFile={includeFile}
            setIncludeFile={setIncludeFile}
            refreshResult={refreshResult}
          />
          {/* TODO: add file exclude*/}
        </div>
      )}
    </div>
  )
}
