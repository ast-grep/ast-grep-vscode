import copy from 'copy-to-clipboard'
import React from 'react'

type Options = {
  timeout?: number
}

export function useCopyToClipboard(
  text: string,
  { timeout = 1500 }: Options = {}
) {
  const [hasCopied, setHasCopied] = React.useState(false)

  const onCopy = React.useCallback(() => {
    const didCopy = copy(text, {
      format: 'text/plain'
    })
    setHasCopied(didCopy)
  }, [text])

  React.useEffect(() => {
    if (hasCopied) {
      const id = setTimeout(() => {
        setHasCopied(false)
      }, timeout)

      return () => clearTimeout(id)
    }
  }, [timeout, hasCopied])

  return [hasCopied, onCopy] as const
}
