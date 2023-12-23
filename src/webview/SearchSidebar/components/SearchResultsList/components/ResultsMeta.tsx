import { useThemeType } from '../hooks/useThemeType'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import {
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useTheme
} from '@chakra-ui/react'
// import { SearchInFileError, SearchResults } from '@codeque/core'
import { IoMdInformationCircleOutline } from 'react-icons/io'

// import { openFile } from '../utils'
type SearchInFileError = any

type ResultsMetaProps = {
  time: number | string | undefined
  filesCount: number | string | undefined
  matchesCount: number | string | undefined
  matchedFilesCount: number | string | undefined
  // errors: SearchResults['errors'] | undefined

  errors: any
  startSearch: (useSelectionIfAvailable: boolean) => void
  searchInProgress: boolean
  stopSearch: () => void
  getRelativePath: (filePath: string) => string | undefined
}

const noValue = 'n/a'

const extractLocationFormErrorText = (errorText: string) => {
  const matcher = /\((\d)+(,|:|;)(\d)+\)/g

  const locationStringMatch = errorText.match(matcher)

  if (locationStringMatch?.[0]) {
    const locationString = locationStringMatch[0]

    const [line, column] = locationString
      .replace('(', '')
      .replace(')', '')
      .split(/,|:|;/)
      .map(v => parseInt(v.trim(), 10))

    return {
      start: { line, column },
      end: { line, column }
    }
  }

  return { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } }
}

export function ResultsMeta({
  time = noValue,
  filesCount = noValue,
  matchesCount = noValue,
  matchedFilesCount = noValue,
  errors,
  startSearch,
  searchInProgress,
  stopSearch,
  getRelativePath
}: ResultsMetaProps) {
  const errorsToDisplay: Array<string | SearchInFileError> =
    (errors?.filter(
      (error: Error | string) =>
        typeof error === 'string' || 'filePath' in error
    ) as Array<string | SearchInFileError>) ?? []

  const theme = useTheme()
  const themeType = useThemeType()
  const highlightTheme = themeType === 'dark' ? darkTheme : lightTheme

  const chakraThemeAccessorProperty = themeType === 'dark' ? '_dark' : '_light'
  const popoverBackground = 'var(--vscode-editor-background)'
  const errorBackground = highlightTheme.plain.backgroundColor

  const popoverBorderColor =
    theme.semanticTokens.colors['chakra-border-color'][
      chakraThemeAccessorProperty
    ]

  return (
    <Flex mb="2" alignItems="center">
      {matchesCount !== undefined && (
        <Text>
          Total count: <b>{matchesCount}</b>
        </Text>
      )}
      {matchedFilesCount !== undefined && (
        <Text ml="5">
          Found in <b>{matchedFilesCount}</b> file(s)
        </Text>
      )}
      {time !== undefined && (
        <Text ml="5">
          Found in: <b>{time}s</b>
        </Text>
      )}
      {filesCount !== undefined && (
        <Text ml="5">
          Searched file(s): <b>{filesCount}</b>
        </Text>
      )}
      {errorsToDisplay !== undefined && errorsToDisplay.length > 0 && (
        <Popover>
          <PopoverTrigger>
            <Flex ml="5" color="red.500" cursor="pointer" alignItems="center">
              <Text mr="2">
                Search failed for <b>{errorsToDisplay.length}</b> file(s)
              </Text>
              <IoMdInformationCircleOutline />
            </Flex>
          </PopoverTrigger>

          <PopoverContent
            maxWidth="80vw"
            width="auto"
            backgroundColor={popoverBackground}
            borderColor={popoverBorderColor}
          >
            <PopoverCloseButton />
            <PopoverHeader borderColor={popoverBorderColor}>
              Search Errors
            </PopoverHeader>
            <PopoverBody borderColor={popoverBorderColor}>
              <Flex maxHeight="70vh" overflowY="auto" flexDirection="column">
                {errorsToDisplay.map((error, idx) => {
                  const relativePath = getRelativePath(
                    (error as SearchInFileError)?.filePath
                  )

                  return (
                    <Flex
                      key={idx}
                      flexDir="column"
                      mb="3"
                      border="1px solid"
                      borderColor={popoverBorderColor}
                    >
                      {typeof error === 'string' ? (
                        <Text p={2} backgroundColor={errorBackground}>
                          {error}
                        </Text>
                      ) : (
                        <>
                          <Text
                            fontWeight={600}
                            borderBottom="1px solid"
                            borderColor={popoverBorderColor}
                            p={2}
                            onClick={() => {
                              const location = extractLocationFormErrorText(
                                error.error
                              )

                              // TODO:
                              // openFile({
                              //   filePath: error.filePath,
                              //   location: location,
                              // })
                            }}
                          >
                            {relativePath}
                          </Text>
                          <Text p={2} backgroundColor={errorBackground}>
                            {(error as SearchInFileError)?.error}
                          </Text>
                        </>
                      )}
                    </Flex>
                  )
                })}
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}

      <Button
        onClick={() => {
          if (searchInProgress) {
            stopSearch()
          } else {
            startSearch(true)
          }
        }}
        size="sm"
        width="100px"
        marginLeft="auto"
        colorScheme="blue"
        isLoading={searchInProgress}
        loadingText="Stop"
        // isLoading disables button by default
        disabled={false}
      >
        Search!
      </Button>
    </Flex>
  )
}
