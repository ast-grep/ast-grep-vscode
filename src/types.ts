import { Unport } from 'unport'

type WithId<T> = T & { id: number }

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
  replacement?: string
}

export interface SearchQuery {
  inputValue: string
  includeFile: string
  rewrite: string
}

export type SgSearch = {
  text: string
  range: RangeInfo
  file: string
  lines: string
  language: string
  replacement?: string
}

export type Definition = {
  parent2child: {
    searchResultStreaming: {
      searchResult: DisplayResult[]
      id: number
    } & SearchQuery
    searchEnd: WithId<SearchQuery>
    error: {
      id: number
      error: Error
    }
    setIncludeFile: {
      includeFile: string
    }
  }
  child2parent: {
    search: WithId<SearchQuery>
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
    previewDiff: {
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
