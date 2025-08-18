import * as stylex from '@stylexjs/stylex'
import { VSCodeButton, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react'
import { useState } from 'react'

const styles = stylex.create({
  yaml: {
    marginLeft: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  editor: {
    width: '100%',
  },
  searchButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
})

export default function YamlWidget() {
  const [value, setValue] = useState('')
  return (
    <div {...stylex.props(styles.yaml)}>
      <VSCodeTextArea
        {...stylex.props(styles.editor)}
        value={value}
        placeholder="YAML configuration"
        resize="vertical"
        onInput={(e: any) => {
          const newValue = e.target.value || ''
          setValue(newValue)
        }}
      />
      <VSCodeButton
        {...stylex.props(styles.searchButton)}
        appearance="primary"
        onClick={() => {
          // Handle save or apply logic here
          console.log('YAML Config:', value)
        }}
      >
        Search
      </VSCodeButton>
    </div>
  )
}
