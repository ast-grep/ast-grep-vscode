import { useEffect, useState } from 'react'
import { SearchInput } from './components/SearchInput'
import { SearchResultsList } from './components/SearchResultsList/components/SearchResultsList'
import { MatchWithFileInfo } from './components/SearchResultsList/types'

export const SearchSidebar = () => {
  const [inputValue, setInputValue] = useState('')

  return (
    <div>
      <SearchInput value={inputValue} onChange={setInputValue} />
      <SearchResultsList
        matches={[
          {
            code: `const a = 1;
            class AstGrepTest {
              test() {
                console.log('Hello, world!')
              }
            }

            class AnotherCase {
              get test2() {
                return 123
              }
            }
            `,
            filePath: 'file:///Users/bytedance/Documents/codes/github/ast-grep-vscode/fixture/test.ts',
            end: 10,
            extendedCodeFrame: { code: 'const a = 1;', startLine: 0 },
            start: 1,
            loc: {
              start: { column: 12, line: 0 },
              end: { column: 12, line: 0 }
            },
            query: 'const'
          }
        ]}
        getRelativePath={function (filePath: string): string | undefined {
          return ''
        }}
        getWorkspace={function (filePath: string): string | undefined {
          return ''
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
