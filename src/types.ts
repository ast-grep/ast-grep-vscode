import { Unport } from 'unport'

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
    reload: {
      id: string
    }
  }
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>
