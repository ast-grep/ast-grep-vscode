import { SearchInput } from './comps/SearchInput'
import { Center, HStack, IconButton, VStack } from '@chakra-ui/react'
import { useBoolean } from 'react-use'
import { HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi'

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
        _hover={{
          background: 'var(--vscode-list-inactiveSelectionBackground)'
        }}
        w={16}
        h="100%"
        cursor="pointer"
        onClick={toggleIsExpanded}
      >
        {isExpanded ? (
          <HiOutlineChevronDown pointerEvents="none" />
        ) : (
          <HiOutlineChevronRight pointerEvents="none" />
        )}
      </Center>
      <VStack gap={6} flex={1}>
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onKeyEnterUp={refreshResult}
        />
        {isExpanded ? (
          <SearchInput
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
