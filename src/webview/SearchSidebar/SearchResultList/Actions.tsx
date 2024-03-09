import { MouseEvent, useCallback } from 'react'
import type { DisplayResult } from '../../../types'
import {
  acceptChangeAndRefresh,
  acceptFileChanges,
} from '../../hooks/useSearch'

import * as stylex from '@stylexjs/stylex'
import { VscReplace, VscReplaceAll } from 'react-icons/vsc'

const styles = stylex.create({
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'row',
    // see https://github.com/facebook/stylex/issues/373
    width: '0',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    borderRadius: '5px',
    margin: '1px 0',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--vscode-toolbar-hoverBackground)',
    },
    // compensate list's style padding: '0 .8em 0 .4em',
    ':first-child': {
      marginLeft: '0.4em',
    },
    ':last-child': {
      marginRight: '0.4em',
    },
  },
})

interface ActionsProps {
  className: string
  match: DisplayResult
}

export function MatchActions({ className: parent, match }: ActionsProps) {
  const { className: local } = stylex.props(styles.list)
  const onClick = useCallback(() => {
    acceptChangeAndRefresh({
      filePath: match.file,
      changes: [
        {
          replacement: match.replacement!,
          range: match.range,
        },
      ],
    })
  }, [match])
  if (!match.replacement) {
    return null
  }
  return (
    <ul className={`${local} ${parent}`} role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      <li {...stylex.props(styles.action)} onClick={onClick}>
        <VscReplace role="button" title="Replace" tabIndex={0} />
      </li>
    </ul>
  )
}

interface FileActionsProps {
  className: string
  filePath: string
  hasReplace: boolean
}

export function FileActions({
  className: parent,
  filePath,
  hasReplace,
}: FileActionsProps) {
  const { className: local } = stylex.props(styles.list)
  const onClick = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      e.stopPropagation()
      acceptFileChanges(filePath)
    },
    [filePath],
  )
  if (!hasReplace) {
    return null
  }
  return (
    <ul className={`${local} ${parent}`} role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      <li {...stylex.props(styles.action)} onClick={onClick}>
        <VscReplaceAll role="button" title="Replace All" tabIndex={0} />
      </li>
    </ul>
  )
}
