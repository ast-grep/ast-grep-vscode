export type SgSearch = {
  text: string
  range: {
    byteOffset: {
      start: number
      end: number
    }
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
  file: string
  lines: string
  language: string
}
