import { VscReplace } from 'react-icons/vsc'
export function Actions() {
  return (
    <ul role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      <li role="presentation" title="Replace">
        <a role="button" aria-label="Replace" tabIndex={0}>
          <VscReplace />
        </a>
      </li>
    </ul>
  )
}
