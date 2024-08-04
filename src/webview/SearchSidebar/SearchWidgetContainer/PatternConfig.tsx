import { SearchInput } from './SearchInput'
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react'
import { usePatternConfig } from '../../hooks/useQuery'
import { useCallback } from 'react'

const titleStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '4px 0 0',
  fontSize: '11px',
  fontWeight: '400',
  lineHeight: '19px',
}
const NOOP = () => {}

export default function PatternConfig() {
  const [strictness, setStrictness] = usePatternConfig('strictness', 'smart')
  const [selector, setSelector] = usePatternConfig('selector', '')
  // biome-ignore lint/suspicious/noExplicitAny: onChange event has wrong type signature.
  const onStrictnessChange = useCallback(
    (e: any) => {
      const select = e.target as HTMLSelectElement
      setStrictness(select.value)
    },
    [setStrictness],
  )
  return (
    <div>
      <h4 style={titleStyle}>Selector</h4>
      <SearchInput
        isSingleLine={true}
        placeholder="sub-node kind to match"
        value={selector}
        onChange={setSelector}
        onKeyEnterUp={NOOP}
      />
      <h4 style={titleStyle}>Strictness</h4>
      <VSCodeDropdown
        value={strictness}
        onChange={onStrictnessChange}
        style={{ width: '100%', zIndex: '2' }}
      >
        <VSCodeOption value="cst">Cst (ignore nothing)</VSCodeOption>
        <VSCodeOption value="smart">Smart (default option)</VSCodeOption>
        <VSCodeOption value="ast">Ast (ignore unnamed nodes)</VSCodeOption>
        <VSCodeOption value="relaxed">Relaxed (ignore comments)</VSCodeOption>
        <VSCodeOption value="signature">Signature (ignore text)</VSCodeOption>
      </VSCodeDropdown>
    </div>
  )
}
