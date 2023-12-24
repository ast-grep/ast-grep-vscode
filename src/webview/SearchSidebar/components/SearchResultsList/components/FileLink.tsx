import { openFile } from '../../../postMessage'
import { MatchWithFileInfo } from '../types'
import { Link, LinkProps, Text } from '@chakra-ui/react'

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
  const filePathStartsWithDot = relativeFilePath?.startsWith('./')

  const displayRelativePath = filePathStartsWithDot
    ? relativeFilePath?.substring(2)
    : relativeFilePath

  return (
    <Link
      onClick={ev => {
        ev.stopPropagation()
        onClick?.()
        openFile({
          filePath: match.filePath,
          // @ts-ignore
          location: match.loc
        })
      }}
      fontWeight="500"
      display="inline-flex"
      cursor="pointer"
      {...rest}
    >
      <Text
        as="div"
        style={{
          textAlign: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <span>{displayRelativePath}</span>
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
