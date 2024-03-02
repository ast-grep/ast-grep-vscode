import { SearchInput } from './SearchInput'
const titleStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '4px 0 0',
  fontSize: '11px',
  fontWeight: '400',
  lineHeight: '19px',
}

interface IncludeFileProps {
  includeFile: string
  setIncludeFile: (value: string) => void
  refreshResult: () => void
}

export default function IncludeFile({
  includeFile,
  setIncludeFile,
  refreshResult,
}: IncludeFileProps) {
  return (
    <div>
      <h4 style={titleStyle}>files to include</h4>
      <SearchInput
        isSingleLine={true}
        placeholder="e.g. src, packages. No glob pattern"
        value={includeFile}
        onChange={setIncludeFile}
        onKeyEnterUp={refreshResult}
      />
    </div>
  )
}
