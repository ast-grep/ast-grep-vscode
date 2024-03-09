import * as stylex from '@stylexjs/stylex'
import { memo } from 'react'
interface FileLinkProps {
  filePath: string
}

const styles = stylex.create({
  fileLink: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  fileName: {
    flex: '0 0 auto',
    whiteSpace: 'pre',
    color: 'inherit',
  },
  basePath: {
    flex: '1 1 auto',
    opacity: 0.95,
    marginLeft: '0.5em',
    fontSize: '0.9em',
    whiteSpace: 'pre',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

function splitPath(path: string) {
  if (path.startsWith('./')) {
    path = path.slice(2)
  }
  const lastSlash = path.lastIndexOf('/')
  if (lastSlash === -1) {
    return {
      fileName: path,
      basePath: '',
    }
  }
  return {
    fileName: path.slice(lastSlash + 1),
    basePath: path.slice(0, lastSlash),
  }
}

export const FileLink = memo(({ filePath }: FileLinkProps) => {
  const { fileName, basePath } = splitPath(filePath)
  return (
    <div {...stylex.props(styles.fileLink)}>
      <a {...stylex.props(styles.fileName)}>{fileName}</a>
      <span {...stylex.props(styles.basePath)}>{basePath}</span>
    </div>
  )
})
