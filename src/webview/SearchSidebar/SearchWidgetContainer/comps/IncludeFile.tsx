import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
const titleStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '4px 0 0',
  fontSize: '11px',
  fontWeight: '400',
  lineHeight: '19px'
}
export default function IncludeFile() {
  return (
    <div>
      <h4 style={titleStyle}>files to include</h4>
      <VSCodeTextField style={{ width: '100%' }} />
    </div>
  )
}
