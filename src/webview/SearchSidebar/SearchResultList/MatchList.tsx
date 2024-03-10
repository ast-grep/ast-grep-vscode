import { CodeBlock } from './CodeBlock'
import { MatchActions } from './Actions'
import type { DisplayResult } from '../../../types'
import { useHover } from 'react-use'

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
})

function OneMatch({ match }: { match: DisplayResult }) {
  const [hoverable] = useHover(hovered => {
    return (
      <li {...stylex.props(styles.codeItem)}>
        <CodeBlock match={match} />
        {hovered && <MatchActions match={match} />}
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
