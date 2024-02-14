import { Link, Text } from '@chakra-ui/react'
import { openFile } from '../../../postMessage'

interface FileLinkProps {
  filePath: string
}

export const FileLink = ({ filePath }: FileLinkProps) => {
  return (
    <Link
      onClick={e => {
        e.stopPropagation()
        openFile({
          filePath
        })
      }}
      fontWeight="500"
      display="inline-flex"
      cursor="pointer"
    >
      <Text
        size="13"
        style={{
          textAlign: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {filePath}
      </Text>
    </Link>
  )
}
