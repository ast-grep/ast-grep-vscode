import {
  VSCodeTextArea,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react'
import { useCallback } from 'react'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  onKeyEnterUp: () => void
  isSingleLine?: boolean
}

const style = {
  width: '100%',
  // the shadow-dom has lineheight
  lineHeight: 0,
}

// the builtin vscode component has weird padding
function hackTextareaPadding(vscodeInput: any) {
  const textarea = vscodeInput.shadowRoot!.querySelector('textarea')
  if (textarea) {
    textarea.style.padding = '3px 0 3px 6px'
    textarea.style.lineHeight = '18px'
  }
}

const SearchInput = ({
  value,
  onChange,
  onKeyEnterUp,
  placeholder,
  isSingleLine = false,
}: SearchInputProps) => {
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
      ref={hackTextareaPadding}
    />
  )
}

export { SearchInput }
