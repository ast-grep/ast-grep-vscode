import { Unport } from 'unport'

export type Position = {
  line: number
  column: number
  index?: number
}

export type SgSearch = {
  text: string
  range: {
    byteOffset: {
      start: number
      end: number
    }
    start: Position
    end: Position
  }
  file: string
  lines: string
  language: string
}

export type Definition = {
  parent2child: {
    searchResultStreaming: {
      searchResult: SgSearch[]
      id: number
    }
    searchEnd: {
      id: number
    }
  }
  child2parent: {
    search: {
      inputValue: string
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
