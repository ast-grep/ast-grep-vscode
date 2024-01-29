import { Flex, HStack, IconButton, VStack, Box } from '@chakra-ui/react'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'
import { useBoolean } from 'react-use'
import { SgSearch } from '../../../../../types'
import { CodeBlock } from './CodeBlock'
import { darkTheme } from '../utils/codeHighlightThemes'
import { FileLink } from './FileLink'

interface TreeItemProps {
  filePath: string
  matches: SgSearch[]
}

const getFileExtension = (filePath: string) =>
  filePath.match(/(?<=(\.))(\w)+$/g)?.[0]

const TreeItem = ({ filePath, matches }: TreeItemProps) => {
  const [isExpanded, toggleIsExpanded] = useBoolean(true)

  return (
    <VStack w="100%" pl="10" p="2">
      <HStack w="100%" p="2" onClick={toggleIsExpanded} cursor="pointer">
        <IconButton
          flex={0}
          background="transparent"
          aria-label="expand/collapse button"
          pointerEvents="none"
          icon={
            isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />
          }
          mr="2"
        />
        <HStack flex={1}>
          <FileLink filePath={filePath} />
          <div>{`(${matches.length})`}</div>
        </HStack>
      </HStack>

      <HStack w="100%">
        <Box w="20px" />
        <VStack flex="1">
          {isExpanded &&
            matches?.map(match => {
              const { file, language, lines, range, text } = match
              const matchHighlight = [
                {
                  start: {
                    line: range.start.line,
                    column: range.start.column
                  },
                  end: {
                    line: range.end.line,
                    column: range.end.column
                  },
                  style: {
                    backgroundColor: '#35485b',
                    boxShadow: `0px 5px 0px #35485b, 0px -5px 0px #35485b`
                  }
                }
              ]
              return (
                <Flex
                  w="100%"
                  p="5"
                  key={file + range.start.line + range.start.column}
                  background={darkTheme.plain.backgroundColor}
                >
                  <CodeBlock
                    startLineNumber={range.start.line}
                    theme={darkTheme}
                    customHighlight={matchHighlight}
                    fileExtension={getFileExtension(filePath)}
                  >
                    {lines}
                  </CodeBlock>
                </Flex>
              )
            })}
        </VStack>
      </HStack>
    </VStack>
  )
}
export default TreeItem
