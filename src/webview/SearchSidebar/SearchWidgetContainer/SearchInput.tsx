import { VSCodeTextArea, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { useCallback, useEffect, useRef } from 'react'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  onKeyEnterUp: () => void
  isSingleLine?: boolean
  focusOnWindowFocus?: boolean
}

const style = {
  width: '100%',
  // the shadow-dom has lineheight
  lineHeight: 0,
}

// the builtin vscode component has weird padding
// biome-ignore lint/suspicious/noExplicitAny: ignore vscode hacking
function hackTextareaPadding(vscodeInput: any) {
  const textarea = vscodeInput?.shadowRoot?.querySelector('textarea')
  if (textarea) {
    textarea.style.padding = '3px 0 3px 6px'
    textarea.style.lineHeight = '18px'
  }
}

// focus input when window receives focus, and select all text if there's content
function useFocusOnWindowFocus(enabled: boolean) {
  // biome-ignore lint/suspicious/noExplicitAny: web component ref
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled) return
    const handleFocus = () => {
      const el = inputRef.current
      const inner = el?.shadowRoot?.querySelector('textarea') ??
        el?.shadowRoot?.querySelector('input')
      if (!inner) return
      inner.focus()
      if (inner.value) {
        inner.select()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [enabled])

  const setRef = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: web component ref
    (el: any) => {
      inputRef.current = el
    },
    [],
  )

  return setRef
}

const SearchInput = ({
  value,
  onChange,
  onKeyEnterUp,
  placeholder,
  isSingleLine = false,
  focusOnWindowFocus = false,
}: SearchInputProps) => {
  const focusRef = useFocusOnWindowFocus(focusOnWindowFocus)
  const setRef = useCallback(
    (el: any) => {
      focusRef(el)
      if (!isSingleLine) {
        hackTextareaPadding(el)
      }
    },
    [focusRef, isSingleLine],
  )

  const handleInput = useCallback(
    // I know any better
    // biome-ignore lint/suspicious/noExplicitAny: onInput event has wrong type signature.
    (e: any) => {
      const newValue = e.target.value || ''
      onChange(newValue)
    },
    [onChange],
  )
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onKeyEnterUp()
      }
    },
    [onKeyEnterUp],
  )
  const rows = value.split(/\r?\n/).length
  if (isSingleLine) {
    return (
      <VSCodeTextField
        ref={setRef}
        style={{ width: '100%' }}
        value={value}
        placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={onKeyDown}
      />
    )
  }

  return (
    <VSCodeTextArea
      style={style}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      ref={setRef}
    />
  )
}

export { SearchInput }
