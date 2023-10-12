export type Position = {
  line: number
  column: number
  index?: number
}

export type Location = {
  start: Position
  end: Position
}

export type MatchPosition = {
  start: number
  end: number
  loc: Location
}

export type Match = MatchPosition

export type ExtendedCodeFrame = {
  code: string
  startLine: number
}

export type MatchWithFileInfo = Omit<Match, 'node'> & {
  query: string
  code: string
  filePath: string
  extendedCodeFrame: ExtendedCodeFrame
  indentationBase?: number
}

