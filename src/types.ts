import type { Unport } from 'unport'

type WithId<T> = T & { id: number }

export type Position = {
  line: number
  column: number
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
  language: string
}

interface PatternhQueryBasic {
  pattern: string
  rewrite: string
  strictness: string
  selector: string
  lang: string
}

export type PatternQuery = PatternhQueryBasic & {
  includeFile: string
}

interface YAMLQueryBasic {
  yaml: string
}

export type YAMLQuery = YAMLQueryBasic & {
  includeFile: string
}

export type SearchQueryBasic = PatternhQueryBasic | YAMLQueryBasic

export type SearchQuery = PatternQuery | YAMLQuery

export type SgSearch = {
  text: string
  range: RangeInfo
  file: string
  lines: string
  language: string
  replacement?: string
}

export interface ParentToChild {
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
  refreshSearchResult: {
    id: number
    updatedResults: DisplayResult[]
    fileName: string
  }
  refreshAllSearch: unknown
  clearSearchResults: unknown
  toggleAllSearch: unknown
  searchByCode: { text: string }
  enableYAML: boolean
  searchByYAML: { text: string }
  focusSearchInput: unknown
}

export interface Diff {
  replacement: string
  range: RangeInfo
}

export interface YAMLConfig {
  yaml: string
  includeFile: string
  rewrite?: boolean
}

export interface ChildToParent {
  search: WithId<SearchQuery>
  yaml: WithId<YAMLConfig>
  reload: unknown
  openFile: {
    filePath: string
    locationsToSelect: {
      start: Position
      end: Position
    }
  }
  previewDiff: {
    filePath: string
    locationsToSelect: {
      start: Position
      end: Position
    }
    diffs: Diff[]
  }
  dismissDiff: {
    filePath: string
    locationsToSelect: {
      start: Position
      end: Position
    }
    diffs: Diff[]
  }
  commitChange: WithId<
    {
      filePath: string
      diffs: Diff[]
    } & SearchQueryBasic
  >
  replaceAll: WithId<
    {
      changes: {
        filePath: string
        diffs: Diff[]
      }[]
    } & SearchQueryBasic
  >
}

export type Definition = {
  parent2child: ParentToChild
  child2parent: ChildToParent
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>
