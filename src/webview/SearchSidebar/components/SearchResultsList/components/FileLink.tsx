import { MatchWithFileInfo } from '../types'
import { Link, LinkProps, Text } from '@chakra-ui/react'

// TODO:
// import { openFile } from '../utils'

type FileLinkProps = LinkProps & {
  match: {
    filePath: MatchWithFileInfo['filePath']
    loc?: MatchWithFileInfo['loc']
  }
  relativeFilePath?: string
  matchStartLine?: number
  matchStartCol?: number
  onClick?: () => void
}

export function FileLink({
  match,
  relativeFilePath,
  matchStartCol,
  matchStartLine,
  onClick,
  ...rest
}: FileLinkProps) {
  const filePathStartsWithDot = relativeFilePath?.startsWith('.')

  const displayRelativePath = filePathStartsWithDot
    ? relativeFilePath?.substring(1)
    : relativeFilePath

  return (
    <Link
      onClick={ev => {
        ev.stopPropagation()
        onClick?.()

        // openFile({
        //   filePath: match.filePath,
        //   location: match.loc,
        // })
      }}
      fontWeight="500"
      display="inline-flex"
      {...rest}
    >
      {/** workaround for a problem with initial dot being moved to the end of string when using rtl */}
      {filePathStartsWithDot && <Text as="span">.</Text>}
      <Text
        as="div"
        style={{
          textAlign: 'left',
          direction: 'rtl',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <Text as="span">{displayRelativePath}</Text>
        {matchStartLine !== undefined && matchStartCol !== undefined && (
          <>
            <Text as="span">:</Text>
            <Text as="span" color="#c792ea">
              {matchStartLine}
            </Text>
            <Text as="span">:</Text>
            <Text as="span" color="#ffcb8b">
              {matchStartCol}
            </Text>
          </>
        )}
      </Text>
    </Link>
  )
}
