import { Box, Flex } from '@chakra-ui/react'
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { useCallback } from 'react'

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  onKeyEnterUp: () => void
}

const SearchInput = ({ value, onChange, onKeyEnterUp }: SearchInputProps) => {
  const handleInput = useCallback(
    (e: { target: { value: string } }) => {
      const newValue = e.target.value
      onChange?.(newValue)
    },
    [onChange]
  )

  return (
    <Flex w="100%">
      <VSCodeTextField
        style={{ flex: 1 }}
        value={value}
        onInput={handleInput as any}
        onKeyUp={event => {
          if (event.key === 'Enter') {
            onKeyEnterUp()
          }
        }}
      ></VSCodeTextField>
    </Flex>
  )
}

export { SearchInput }
