import * as stylex from '@stylexjs/stylex'
import { memo } from 'react'
import { Icon } from './Icon'

interface FileLinkProps {
  filePath: string
  language: string
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
    opacity: 0.8,
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

export const FileLink = memo(({ filePath, language }: FileLinkProps) => {
  const { fileName, basePath } = splitPath(filePath)
  const languageName = language.toLowerCase().replace('-exp', '')
  return (
    <div {...stylex.props(styles.fileLink)}>
      <Icon name={languageName} />
      <span {...stylex.props(styles.fileName)}>{fileName}</span>
      <span {...stylex.props(styles.basePath)}>{basePath}</span>
    </div>
  )
})
