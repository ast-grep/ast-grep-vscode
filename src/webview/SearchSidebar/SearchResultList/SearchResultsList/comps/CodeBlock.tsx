import { Highlight, HighlightProps } from './Highlight'
import { darkTheme } from '../utils/codeHighlightThemes'

export type CodeBlockProps = HighlightProps

export const CodeBlock = ({
  children,
  theme = darkTheme,
  highlight = true,
  ...props
}: CodeBlockProps) => {
  const code = children.trimEnd()

  return (
    <div
      style={{
        ...theme.plain,
        whiteSpace: 'pre',
        fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,monospace'
      }}
    >
      <Highlight theme={theme} highlight={highlight} {...props}>
        {code}
      </Highlight>
    </div>
  )
}
