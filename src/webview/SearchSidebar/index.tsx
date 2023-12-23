import type { SgSearch } from '../../types'
import { SearchInput } from './components/SearchInput'
import { SearchResultsList } from './components/SearchResultsList/components/SearchResultsList'
import { MatchWithFileInfo } from './components/SearchResultsList/types'
import { useSgSearch } from './postMessage'
import { useDebounceFn, useLocalStorageState } from 'ahooks'
import { useEffect, useState } from 'react'

const useSearchResult = (inputValue: string) => {
  const [result, setResult] = useState<SgSearch[]>([])
  const postExtension = useSgSearch()

  const { run: refreshResult } = useDebounceFn(() => {
    ;(async () => {
      const res = await postExtension(inputValue)
      setResult(res)
    })()
  })

  useEffect(() => {
    refreshResult()
  }, [inputValue])

  return {
    result,
    refreshResult
  }
}

export const SearchSidebar = () => {
  const [inputValue = '', setInputValue] = useLocalStorageState<string>(
    'ast-grep-search-input-value',
    {
      defaultValue: ''
    }
  )
  const { result, refreshResult } = useSearchResult(inputValue)

  useEffect(() => {
    console.log(result)
  }, [result])

  return (
    <div>
      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        onKeyEnterUp={refreshResult}
      />
      {/* debug here */}
      <SearchResultsList
        matches={result ? format(result, inputValue) : []}
        getRelativePath={function (filePath: string): string | undefined {
          return filePath
        }}
        getWorkspace={function (filePath: string): string | undefined {
          return filePath
        }}
        displayLimit={10}
        extendDisplayLimit={function (): void {}}
        showAllResults={function (): void {}}
        removeMatch={function (
          filePath: string,
          start: number,
          end: number
        ): void {}}
        removeFile={function (filePath: string): void {}}
        removeWorkspace={function (workspace: string): void {}}
        isLoading={false}
        isWorkspace={false}
      />
    </div>
  )
}

// {
//   content: "const a = 1;",
//   position: {
//     end: {
//       character: 12,
//       line: 0,
//     },
//     start: {
//       character: 0,
//       line: 0,
//     },
//   },
//   uri: "file:///Users/xxx/Documents/codes/github/ast-grep-vscode/fixture/test.ts",
// }

function format(res: SgSearch[], pattern: string): MatchWithFileInfo[] {
  return res.map(item => {
    return {
      code: item.lines,
      filePath: item.file,
      start: item.range.byteOffset.start,
      end: item.range.byteOffset.end,
      extendedCodeFrame: {
        code: item.lines,
        startLine: item.range.start.line
      },
      loc: {
        start: {
          column: item.range.start.column,
          line: item.range.start.line
        },
        end: {
          column: item.range.end.column,
          line: item.range.end.line
        }
      },
      query: pattern
    }
  })
}
