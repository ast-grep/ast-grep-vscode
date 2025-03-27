import { SearchInput } from './SearchInput'
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeLink,
  VSCodeCheckbox,
} from '@vscode/webview-ui-toolkit/react'
import {
  useBoolean,
  usePatternConfig,
  useSearchField,
} from '../../hooks/useQuery'
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
  const [allowEmptyReplace, setAllowEmptyReplace] =
    useBoolean('allowEmptyReplace')

  const onStrictnessChange = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: onChange event has wrong type signature.
    (e: any) => {
      const select = e.target as HTMLSelectElement
      setStrictness(select.value)
    },
    [setStrictness],
  )

  const onAllowEmptyReplaceChange = useCallback(
    (e: any) => {
      const select = e.target as HTMLElement

      setAllowEmptyReplace(
        // this condition is inverted on purpose
        // we only see the class right before it changes,
        // so take what the value will be, not what it is now.
        !select.classList.contains('checked') ? 'true' : 'false',
      )
    },
    [setAllowEmptyReplace],
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
      <VSCodeCheckbox
        value={allowEmptyReplace}
        onChange={onAllowEmptyReplaceChange}
      >
        Make empty replace delete matches
      </VSCodeCheckbox>
    </div>
  )
}
