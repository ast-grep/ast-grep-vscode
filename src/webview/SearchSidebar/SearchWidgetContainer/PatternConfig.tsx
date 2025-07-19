import { VSCodeDropdown, VSCodeLink, VSCodeOption } from '@vscode/webview-ui-toolkit/react'
import { useCallback } from 'react'
import { usePatternConfig, useSearchField } from '../../hooks/useQuery'
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
const NOOP = () => {}

function Link({ href }: { href: string }) {
  return (
    <VSCodeLink style={{ fontSize: '0.9em', marginLeft: '0.25em' }} href={href}>
      ⓘ
    </VSCodeLink>
  )
}

export default function PatternConfig() {
  const [strictness, setStrictness] = useSearchField('strictness')
  const [selector, setSelector] = usePatternConfig('selector')
  const onStrictnessChange = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: onChange event has wrong type signature.
    (e: any) => {
      const select = e.target as HTMLSelectElement
      setStrictness(select.value)
    },
    [setStrictness],
  )
  return (
    <div>
      <h4 style={titleStyle}>
        Strictness
        <Link href="https://ast-grep.github.io/advanced/match-algorithm.html" />
      </h4>
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
      <h4 style={titleStyle}>
        Selector
        <Link href="https://ast-grep.github.io/advanced/faq.html#my-pattern-does-not-work-why" />
      </h4>
      <SearchInput
        isSingleLine={true}
        placeholder="sub-node kind to match"
        value={selector}
        onChange={setSelector}
        onKeyEnterUp={NOOP}
      />
      <h4 style={titleStyle}>Strictness/Selector requires latest ast-grep.</h4>
    </div>
  )
}
