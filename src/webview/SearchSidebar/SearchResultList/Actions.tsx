import { type MouseEvent, useCallback } from 'react'
import type { DisplayResult } from '../../../types'
import {
  acceptChangeAndRefresh,
  acceptFileChanges,
  dismissOneMatch,
  dismissOneFile,
} from '../../hooks/useSearch'

import * as stylex from '@stylexjs/stylex'
import { VscReplace, VscReplaceAll, VscClose } from 'react-icons/vsc'

const styles = stylex.create({
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    flex: '0 0 auto',
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
      marginRight: '0.2em',
    },
  },
})

interface ActionsProps {
  match: DisplayResult
}

export function MatchActions({ match }: ActionsProps) {
  const onClick = useCallback(() => {
    acceptChangeAndRefresh({
      filePath: match.file,
      diffs: [
        {
          replacement: match.replacement!,
          range: match.range,
        },
      ],
    })
  }, [match])
  const onDismiss = useCallback(() => {
    dismissOneMatch(match)
  }, [match])
  return (
    <ul {...stylex.props(styles.list)} role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      {typeof match.replacement === 'string' ? (
        <li {...stylex.props(styles.action)} onClick={onClick}>
          <VscReplace role="button" title="Replace" tabIndex={0} />
        </li>
      ) : null}
      {/* VSCode supports shortcut Dismiss (⌘Backspace)*/}
      <li {...stylex.props(styles.action)} onClick={onDismiss}>
        <VscClose role="button" title="Dismiss" tabIndex={0} />
      </li>
    </ul>
  )
}

interface FileActionsProps {
  filePath: string
  hasReplace: boolean
}

export function FileActions({ filePath, hasReplace }: FileActionsProps) {
  const onClick = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      e.stopPropagation()
      acceptFileChanges(filePath)
    },
    [filePath],
  )
  const onDismiss = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      e.stopPropagation()
      dismissOneFile(filePath)
    },
    [filePath],
  )
  return (
    <ul {...stylex.props(styles.list)} role="toolbar">
      {/* VSCode supports shortcut Replace (⇧⌘1)*/}
      {hasReplace && (
        <li {...stylex.props(styles.action)} onClick={onClick}>
          <VscReplaceAll role="button" title="Replace All" tabIndex={0} />
        </li>
      )}
      {/* VSCode supports shortcut Dismiss (⌘Backspace)*/}
      <li {...stylex.props(styles.action)} onClick={onDismiss}>
        <VscClose role="button" title="Dismiss" tabIndex={0} />
      </li>
    </ul>
  )
}
