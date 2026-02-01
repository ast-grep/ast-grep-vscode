import { VSCodeTextArea, VSCodeTextField } from '@vscode/webview-ui-toolkit/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

export interface SearchInputHandle {
  focus: () => void
}

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
// biome-ignore lint/suspicious/noExplicitAny: ignore vscode hacking
function hackTextareaPadding(vscodeInput: any) {
  const textarea = vscodeInput?.shadowRoot?.querySelector('textarea')
  if (textarea) {
    textarea.style.padding = '3px 0 3px 6px'
    textarea.style.lineHeight = '18px'
  }
}

const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(({
  value,
  onChange,
  onKeyEnterUp,
  placeholder,
  isSingleLine = false,
}, ref) => {
  const textAreaRef = useRef<HTMLElement>(null)
  const textFieldRef = useRef<HTMLElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      // Access the actual input element from the shadow DOM
      const element = isSingleLine ? textFieldRef.current : textAreaRef.current
      if (element) {
        // VSCode UI Toolkit components use shadow DOM, need to access internal input
        const shadowRoot = (element as any).shadowRoot
        const input = shadowRoot?.querySelector('textarea, input') as HTMLInputElement | HTMLTextAreaElement
        if (input) {
          input.focus()
        }
      }
    },
  }))

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

  const combinedTextAreaRef = useCallback((node: any) => {
    hackTextareaPadding(node)
    textAreaRef.current = node
  }, [])

  if (isSingleLine) {
    return (
      <VSCodeTextField
        style={{ width: '100%' }}
        value={value}
        placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={onKeyDown}
        ref={textFieldRef as any}
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
      ref={combinedTextAreaRef}
    />
  )
})

export { SearchInput }
