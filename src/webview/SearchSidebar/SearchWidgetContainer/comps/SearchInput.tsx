import { VSCodeTextArea } from '@vscode/webview-ui-toolkit/react'
import { useCallback } from 'react'

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  onKeyEnterUp: () => void
}

const SearchInput = ({
  value,
  onChange,
  onKeyEnterUp,
  placeholder,
}: SearchInputProps) => {
  // onInput event has wrong type signature.
  // I know any better
  const handleInput = useCallback(
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

  return (
    <VSCodeTextArea
      style={{ width: '100%' }}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={onKeyDown}
    ></VSCodeTextArea>
  )
}

export { SearchInput }
