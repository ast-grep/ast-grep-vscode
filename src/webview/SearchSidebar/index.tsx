import { SearchInput } from './components/SearchInput'
import { SearchResultsList } from './components/SearchResultsList/components/SearchResultsList'
import { MatchWithFileInfo } from './components/SearchResultsList/types'
import { MessageResponse, usePostExtension } from './usePostMessage'
import { useDebounceFn, useLocalStorageState } from 'ahooks'
import { useEffect, useState } from 'react'

const useSearchResult = (inputValue: string) => {
  const [result, setResult] = useState<Partial<MessageResponse>>({})
  const postExtension = usePostExtension()

  const { run: refreshResult } = useDebounceFn(() => {
    ;(async () => {
      const res = await postExtension({ inputValue })
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
      <pre style={{ display: 'none' }}>{JSON.stringify(result, null, 2)}</pre>
      <SearchResultsList
        matches={result.data ? format(result.data, inputValue) : []}
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

function format(
  res: MessageResponse['data'],
  pattern: string
): MatchWithFileInfo[] {
  return res.map(item => {
    return {
      code: item.content,
      filePath: item.uri,
      start: item.position.start.character,
      end: item.position.end.character,
      extendedCodeFrame: {
        code: item.content,
        startLine: item.position.start.line
      },
      loc: {
        start: {
          column: item.position.start.character,
          line: item.position.start.line
        },
        end: {
          column: item.position.end.character,
          line: item.position.end.line
        }
      },
      query: pattern
    }
  })
}
