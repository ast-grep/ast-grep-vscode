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
  const handleInput = useCallback(
    (e: { target: { value: string } }) => {
      const newValue = e.target.value
      onChange(newValue)
    },
    [onChange],
  )
  const rows = value.split(/\r?\n/).length

  return (
    <VSCodeTextArea
      style={{ width: '100%' }}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onInput={handleInput as any}
      onKeyUp={event => {
        if (event.key === 'Enter') {
          onKeyEnterUp()
        }
      }}
    ></VSCodeTextArea>
  )
}

export { SearchInput }
