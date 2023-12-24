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
    search: {
      searchResult: SgSearch[]
      id: string
    }
  }
  child2parent: {
    search: {
      inputValue: string
      id: string
    }
    reload: {}
  }
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>
