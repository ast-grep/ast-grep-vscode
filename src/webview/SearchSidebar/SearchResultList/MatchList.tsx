import { CodeBlock } from './CodeBlock'
import { MatchActions } from './Actions'
import type { DisplayResult } from '../../../types'
import { useHover } from 'react-use'
import { useActiveItem } from './useListState'

import { memo } from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  codeItem: {
    display: 'flex',
    paddingLeft: '38px',
    listStyle: 'none',
    ':hover': {
      background: 'var( --vscode-list-hoverBackground)',
    },
  },
  active: {
    background: 'var(--vscode-list-inactiveSelectionBackground)',
    ':focus': {
      background: 'var(--vscode-list-activeSelectionBackground)',
      outline:
        '1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))',
      outlineOffset: -1,
    },
  },
})

function OneMatch({ match }: { match: DisplayResult }) {
  const [active, setActive] = useActiveItem(match)
  const styleProps = stylex.props(styles.codeItem, active && styles.active)
  const [hoverable] = useHover(hovered => {
    return (
      <li {...styleProps} onClick={setActive} tabIndex={0}>
        <CodeBlock match={match} />
        {(hovered || active) && <MatchActions match={match} />}
      </li>
    )
  })
  return hoverable
}

interface CodeBlockListProps {
  matches: DisplayResult[]
}
export const MatchList = memo(({ matches }: CodeBlockListProps) => {
  return (
    <>
      {matches?.map(match => {
        const { file, range } = match
        const { byteOffset } = range
        const key = file + byteOffset.start + byteOffset.end
        return <OneMatch key={key} match={match} />
      })}
    </>
  )
})
