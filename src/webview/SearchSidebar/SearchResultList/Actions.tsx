import * as stylex from '@stylexjs/stylex'
import { VscReplace } from 'react-icons/vsc'

const styles = stylex.create({
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'row',
  },
})

export function Actions() {
  return (
    <ul {...stylex.props(styles.list)} role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      <li role="button" title="Replace" tabIndex={0}>
        <VscReplace />
      </li>
    </ul>
  )
}
