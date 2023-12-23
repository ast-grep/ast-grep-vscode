import { darkTheme } from '../utils/codeHighlightThemes'
import { getLanguageBasedOnFileExtension } from '../utils/getLanguageBasedOnFileExtension'
import PrismHighlight from 'prism-react-renderer'
import { defaultProps, PrismTheme } from 'prism-react-renderer'
import React from 'react'

type Token = { types: string[]; content: string }

export const codeRed = 'rgb(220 72 72)'

export type HighlightProps = {
  children: string
  theme?: PrismTheme
  customHighlight?: {
    line?: number
    start?: {
      line: number
      column: number
    }
    end?: {
      line: number
      column: number
    }
    style: any
  }[]
  dedent?: boolean
  highlight?: boolean
  isMultiLine?: boolean
  startLineNumber?: number
  fileExtension?: string
}

type CustomHighlightResults = Array<{
  token: Token
  style: any
  reason?: string
}>

export function Highlight({
  children,
  theme = darkTheme,
  customHighlight,
  highlight,
  startLineNumber,
  fileExtension
}: HighlightProps) {
  const safeStartLineNumber = startLineNumber ?? 0

  if (!highlight) {
    return <span>{children}</span>
  }

  const highlightLanguage = getLanguageBasedOnFileExtension(fileExtension)

  return (
    // @ts-ignore
    <PrismHighlight
      {...defaultProps}
      code={children}
      language={highlightLanguage}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, lineIdx) => {
            const showLineNumber =
              startLineNumber !== undefined
                ? lineIdx + startLineNumber
                : undefined

            const lineNumToCompareHighlight = lineIdx + safeStartLineNumber

            let lineCurrentChar = 0
            const customLineStyle = customHighlight?.find(highlight => {
              const wholeLineHighlight = highlight.line !== undefined

              return (
                wholeLineHighlight &&
                lineNumToCompareHighlight === highlight.line
              )
            })?.style

            return (
              <div
                {...getLineProps({ line, key: lineIdx })}
                style={
                  tokens.length === 1
                    ? { display: 'inline', ...customLineStyle }
                    : customLineStyle
                }
              >
                {showLineNumber !== undefined ? (
                  <span
                    style={{
                      pointerEvents: 'none',
                      color: 'gray',
                      userSelect: 'none',
                      display: 'inline-block',
                      width:
                        (tokens.length + showLineNumber).toString().length * 8 +
                        10 +
                        'px'
                    }}
                  >
                    {showLineNumber}
                  </span>
                ) : null}
                {line.map((token, key) => {
                  const maybeSplitTokens = maybeSplitJSXToken(token, children)

                  const tokensToRender = maybeSplitTokens
                    .map(token => {
                      let customHighlightResult: CustomHighlightResults = []

                      for (const highlight of customHighlight ?? []) {
                        const wholeLineHighlight = highlight.line !== undefined

                        if (!wholeLineHighlight) {
                          const startLine = highlight?.start?.line
                          const startCol = highlight?.start?.column
                          const endLine = highlight?.end?.line
                          const endCol = highlight?.end?.column

                          if (
                            startLine === undefined ||
                            startCol === undefined ||
                            endLine === undefined ||
                            endCol === undefined
                          ) {
                            customHighlightResult = [
                              {
                                style: undefined,
                                token
                              }
                            ]

                            break
                          }

                          // center line, highlight whole line
                          if (
                            lineNumToCompareHighlight > startLine &&
                            lineNumToCompareHighlight < endLine
                          ) {
                            customHighlightResult = [
                              {
                                style: highlight.style,
                                token,
                                reason: 'center line, whole line'
                              }
                            ]

                            break
                          }

                          // first or last or first and last line of match, check if tokens are in bounds
                          if (
                            lineNumToCompareHighlight === startLine ||
                            lineNumToCompareHighlight === endLine
                          ) {
                            const isStartLine =
                              lineNumToCompareHighlight === startLine

                            const isEndLine =
                              lineNumToCompareHighlight === endLine

                            const isStartLineAndTokenInBoundsOfHighlight =
                              isStartLine &&
                              startCol < lineCurrentChar + token.content.length

                            const isEndLineAndTokenInBoundsOfHighlight =
                              isEndLine && endCol > lineCurrentChar

                            const isCenterLineAndTokenInBoundsOfHighlight =
                              lineNumToCompareHighlight > startLine &&
                              lineNumToCompareHighlight < endLine

                            const isTokenInBoundsOfHighlight =
                              isStartLineAndTokenInBoundsOfHighlight ||
                              isEndLineAndTokenInBoundsOfHighlight ||
                              isCenterLineAndTokenInBoundsOfHighlight

                            const shouldSplitOnLeft =
                              isStartLine && startCol > lineCurrentChar

                            const shouldSplitOnRight =
                              isEndLine &&
                              endCol < lineCurrentChar + token.content.length

                            const shouldBeSplit =
                              shouldSplitOnLeft || shouldSplitOnRight

                            if (isTokenInBoundsOfHighlight) {
                              const localCustomHighlightResult: CustomHighlightResults =
                                [
                                  {
                                    token,
                                    style: highlight.style
                                  }
                                ]

                              if (shouldBeSplit) {
                                if (shouldSplitOnLeft) {
                                  const [customHighlight] =
                                    localCustomHighlightResult.splice(
                                      localCustomHighlightResult.length - 1,
                                      1
                                    )
                                  const leftSplitIndex =
                                    startCol - lineCurrentChar

                                  const leftContent =
                                    customHighlight.token.content.substring(
                                      0,
                                      leftSplitIndex
                                    )
                                  const restContent =
                                    customHighlight.token.content.substring(
                                      leftSplitIndex
                                    )

                                  localCustomHighlightResult.push({
                                    token: {
                                      types: customHighlight.token.types,
                                      content: leftContent
                                    },
                                    reason: 'split left',
                                    style: null
                                  })

                                  localCustomHighlightResult.push({
                                    token: {
                                      types: token.types,
                                      content: restContent
                                    },
                                    style: highlight.style,
                                    reason: 'split left'
                                  })
                                }

                                if (shouldSplitOnRight) {
                                  const [customHighlight] =
                                    localCustomHighlightResult.splice(
                                      localCustomHighlightResult.length - 1,
                                      1
                                    )
                                  const rightSplitIndex =
                                    endCol -
                                    (shouldSplitOnLeft
                                      ? startCol
                                      : lineCurrentChar)

                                  const leftContent =
                                    customHighlight.token.content.substring(
                                      0,
                                      rightSplitIndex
                                    )
                                  const restContent =
                                    customHighlight.token.content.substring(
                                      rightSplitIndex
                                    )

                                  localCustomHighlightResult.push({
                                    token: {
                                      types: token.types,
                                      content: leftContent
                                    },
                                    reason: 'split right',
                                    style: highlight.style
                                  })

                                  localCustomHighlightResult.push({
                                    token: {
                                      types: token.types,
                                      content: restContent
                                    },
                                    reason: 'split right',
                                    style: undefined
                                  })
                                }
                              }

                              customHighlightResult = localCustomHighlightResult

                              break
                            }
                          }
                        }
                      }

                      lineCurrentChar += token.content.length

                      return customHighlightResult.length > 0
                        ? customHighlightResult
                        : [{ token, style: undefined }]
                    })
                    .flat(1)

                  return (
                    <React.Fragment key={key}>
                      {tokensToRender.map(({ token, style }, i) => {
                        const props = customGetTokenProps(
                          {
                            token,
                            key: `${key}.${i}`
                          },
                          getTokenProps
                        )

                        return (
                          <span
                            {...props}
                            style={{
                              ...props.style,
                              ...style
                            }}
                          />
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </div>
            )
          })}
        </>
      )}
    </PrismHighlight>
  )
}

const maybeSplitJSXToken = (token: Token, match: any) => {
  const isJSX = /^\s*?<\/?\s*?(\w|\$)+\s*?\/?>\s*?$/gm

  if (token.types[0] === 'plain-text' && token.content.match(isJSX) !== null) {
    const trimmed = token.content

    const tokens = [] as Token[]

    const whitespaceMatch = /^\s*/gm

    const initialWhitespace = trimmed.match(whitespaceMatch)?.[0] || ''

    tokens.push({
      types: ['plain-text'],
      content: initialWhitespace
    })

    if (trimmed.includes('</')) {
      tokens.push({
        types: ['tag', 'punctuation'],
        content: '</'
      })
    } else if (trimmed.includes('<')) {
      tokens.push({
        types: ['tag', 'punctuation'],
        content: '<'
      })
    }

    const identifierMatcher = /\s*?(\w|\$)+\s*?/gm

    const identifier = trimmed.match(identifierMatcher)?.[0] ?? ''
    const isIdentifierUppercase = identifier.charCodeAt(0) < 97

    tokens.push({
      types: ['tag', ...(isIdentifierUppercase ? ['class-name'] : [])],
      content: identifier
    })

    if (trimmed.includes('/>')) {
      tokens.push({
        types: ['tag', 'punctuation'],
        content: '/>'
      })
    } else if (trimmed.includes('>')) {
      tokens.push({
        types: ['tag', 'punctuation'],
        content: '>'
      })
    }

    return tokens
  }

  return [token]
}

const customGetTokenProps = (
  input: { token: Token; key: number | string },
  defaultGetTokenProps: (input: { token: Token; key: number }) => {
    children: React.ReactNode
    style?: Record<string, unknown>
  }
) => {
  const defaultProps = defaultGetTokenProps(
    input as { token: Token; key: number }
  )

  let isWildcard = false

  if (input.token.content.match(/\$\$\$?/)) {
    isWildcard = true
  }

  if (input.token.types.includes('number') && input.token.content === '0x0') {
    isWildcard = true
  }

  return {
    ...defaultProps,
    style: {
      ...defaultProps.style,
      ...(isWildcard
        ? {
            color: codeRed,
            fontWeight: 'bold'
          }
        : {})
    }
  }
}
