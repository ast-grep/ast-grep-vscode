import * as stylex from '@stylexjs/stylex'
import { memo, useState, type FC, useCallback } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import type { DisplayResult } from '../../../types'
import { MatchActions } from './Actions'
import { CodeBlock } from './CodeBlock'
import { ComposeTreeHeader } from './TreeHeader'

const styles = stylex.create({
  resultList: {
    flexGrow: 1,
    overflowY: 'scroll',
    ':not(:hover) .sg-match-tree-item::before': {
      opacity: 0,
    },
    ':hover .sg-match-tree-item::before': {
      opacity: 1,
    },
  },

  codeItem: {
    position: 'relative',
    display: 'flex',
    paddingLeft: '38px',
    listStyle: 'none',
    ':hover': {
      background: 'var( --vscode-list-hoverBackground)',
    },
  },

  hoverLine: {
    '::before': {
      display: 'block',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '13px', // left 16px - translateX 3px
      width: '1px',
      backgroundColor: 'var(--vscode-tree-inactiveIndentGuidesStroke)',
      transition: '0.1s opacity linear',
      content: '',
    },
  },
})

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
}

const SearchResultList = ({ matches }: SearchResultListProps) => {
  const groupCounts = matches.map(([filePath, match]) => match.length)
  const flatMatches = matches.flatMap(([filePath, match]) => match)

  const [collapseSections, setCollapseSections] = useState(() =>
    new Array(flatMatches.length).fill(false),
  )

  const [hoverLineSections, setHoverLineSections] = useState(() =>
    new Array(flatMatches.length).fill(false),
  )

  const [scrollContainerRef, setScrollContainerRef] =
    useState<HTMLElement | null>(null)

  const handleItemMouseEnter = useCallback((sectionIndex: number) => {
    setHoverLineSections(prev => {
      const newSections = [...prev]
      newSections[sectionIndex] = true
      return newSections
    })
  }, [])

  const handleItemMouseLeave = useCallback((sectionIndex: number) => {
    setHoverLineSections(prev => {
      const newSections = [...prev]
      newSections[sectionIndex] = false
      return newSections
    })
  }, [])

  return (
    <GroupedVirtuoso
      {...stylex.props(styles.resultList)}
      groupCounts={groupCounts}
      itemContent={useCallback(
        (index: number, sectionIndex: number) => {
          if (collapseSections[sectionIndex]) return null
          const match = flatMatches[index]

          return (
            <MemoedItem
              {...stylex.props(
                !hoverLineSections[sectionIndex]
                  ? styles.codeItem
                  : [styles.codeItem, styles.hoverLine],
              )}
              onMouseEnter={handleItemMouseEnter}
              onMouseLeave={handleItemMouseLeave}
              match={match}
              key={match.file + match.startIdx + match.endIdx}
              sectionIndex={sectionIndex}
            />
          )
        },
        [
          collapseSections,
          flatMatches,
          handleItemMouseEnter,
          handleItemMouseLeave,
          hoverLineSections,
        ],
      )}
      overscan={window.innerHeight}
      defaultItemHeight={22}
      scrollerRef={ref => setScrollContainerRef(ref as HTMLElement)}
      groupContent={useCallback(
        (index: number) => {
          return (
            <ComposeTreeHeader
              scrollContainerEl={scrollContainerRef}
              isExpanded={collapseSections[index]}
              toggleIsExpanded={() =>
                setCollapseSections(prev => {
                  const newSections = [...prev]
                  newSections[index] = !newSections[index]
                  return newSections
                })
              }
              matches={matches[index][1]}
            />
          )
        },
        [collapseSections, matches, scrollContainerRef, setCollapseSections],
      )}
    />
  )
}

const MemoedItem: FC<
  {
    match: DisplayResult
    sectionIndex: number
  } & Omit<
    React.DetailedHTMLProps<
      React.LiHTMLAttributes<HTMLLIElement>,
      HTMLLIElement
    >,
    'onMouseEnter' | 'onMouseLeave'
  > & {
      onMouseEnter?: (sectionIndex: number) => void
      onMouseLeave?: (sectionIndex: number) => void
    }
> = memo(({ match, sectionIndex, ...rest }) => {
  const [hovered, setHovered] = useState(false)
  const handleMouseEnter: React.MouseEventHandler<HTMLLIElement> = useCallback(
    e => {
      rest.onMouseEnter?.(sectionIndex)
      setHovered(true)
    },
    [],
  )
  const handleMouseLeave: React.MouseEventHandler<HTMLLIElement> = useCallback(
    e => {
      rest.onMouseLeave?.(sectionIndex)
      setHovered(false)
    },
    [],
  )
  return (
    <li
      {...rest}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CodeBlock match={match} />

      {hovered && <MatchActions match={match} />}
    </li>
  )
})

export default memo(SearchResultList)
