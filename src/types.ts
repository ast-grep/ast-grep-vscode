import { Unport } from 'unport'

export type Position = {
  line: number
  column: number
  index?: number
}

export interface RangeInfo {
  byteOffset: {
    start: number
    end: number
  }
  start: Position
  end: Position
}

export interface DisplayResult {
  file: string
  startIdx: number
  endIdx: number
  displayLine: string
  lineSpan: number
  range: RangeInfo
}

export interface SearchQuery {
  inputValue: string
  includeFile: string
}

export type SgSearch = {
  text: string
  range: RangeInfo
  file: string
  lines: string
  language: string
}

export type Definition = {
  parent2child: {
    searchResultStreaming: {
      searchResult: DisplayResult[]
      id: number
      inputValue: string
    }
    searchEnd: {
      id: number
      inputValue: string
    }
    error: {
      id: number
      error: Error
    }
  }
  child2parent: {
    search: SearchQuery & {
      id: number
    }
    reload: {}
    openFile: {
      filePath: string
      locationsToSelect?: {
        start: {
          column: number
          line: number
        }
        end: {
          column: number
          line: number
        }
      }
    }
  }
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>
