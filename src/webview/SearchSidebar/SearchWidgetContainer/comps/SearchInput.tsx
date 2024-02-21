import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
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

  return (
    <VSCodeTextField
      style={{ width: '100%' }}
      value={value}
      placeholder={placeholder}
      onInput={handleInput as any}
      onKeyUp={event => {
        if (event.key === 'Enter') {
          onKeyEnterUp()
        }
      }}
    ></VSCodeTextField>
  )
}

export { SearchInput }
