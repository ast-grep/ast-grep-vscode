import { SearchInput } from './SearchInput'
import { Center, HStack, VStack } from '@chakra-ui/react'
import { useBoolean } from 'react-use'
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc'

interface Props {
  inputValue: string
  setInputValue: (value: string) => void
  refreshResult: () => void
}

const SearchWidgetContainer = ({
  inputValue,
  setInputValue,
  refreshResult
}: Props) => {
  const [isExpanded, toggleIsExpanded] = useBoolean(false)
  return (
    <HStack position="relative">
      <Center
        w={16}
        h="100%"
        cursor="pointer"
        position="absolute"
        top="0"
        left="2px"
        onClick={toggleIsExpanded}
        _hover={{
          background: 'var(--vscode-toolbar-hoverBackground)'
        }}
      >
        {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
      </Center>
      <VStack gap={6} flex={1} ml="18px">
        <SearchInput
          placeholder="Search"
          value={inputValue}
          onChange={setInputValue}
          onKeyEnterUp={refreshResult}
        />
        {isExpanded ? (
          <SearchInput
            placeholder="Replace"
            value={inputValue}
            onChange={setInputValue}
            onKeyEnterUp={refreshResult}
          />
        ) : null}
      </VStack>
    </HStack>
  )
}

export default SearchWidgetContainer
