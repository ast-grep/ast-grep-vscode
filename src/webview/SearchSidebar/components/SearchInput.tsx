import React, { useCallback } from 'react'
import { VSCodeButton, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { useEffect, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
}


const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(value ?? '')

  const handleInput = useCallback((e: { target: { value: string } }) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div>
      <VSCodeTextField
        value={inputValue}
        onInput={handleInput as any}
      ></VSCodeTextField>
    </div>
  )
}

export { SearchInput }
