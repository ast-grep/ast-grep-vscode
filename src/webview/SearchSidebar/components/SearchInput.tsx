import React from 'react'
import { VSCodeButton, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { useEffect, useState } from 'react'

const SearchInput = () => {
  const [input, setInput] = useState('')
  useEffect(() => {}, [input])
  return (
    <div>
      <VSCodeTextField
        onInput={e => {
          console.log(e)
        }}
      ></VSCodeTextField>
    </div>
  )
}

export { SearchInput }
