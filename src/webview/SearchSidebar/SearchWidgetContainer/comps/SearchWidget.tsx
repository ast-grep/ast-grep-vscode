import { SearchInput } from './SearchInput'
import { VStack } from '@chakra-ui/react'
import { useBoolean } from 'react-use'
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  container: {
    position: 'relative',
    margin: '0 12px 0 2px'
  },
  replaceToggle: {
    width: 16,
    height: '100%',
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      background: 'var(--vscode-toolbar-hoverBackground)'
    }
  }
})

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
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.replaceToggle)} onClick={toggleIsExpanded}>
        {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
      </div>
      <VStack gap={6} flex={1} ml="18px">
        <SearchInput
          placeholder="Search"
          value={inputValue}
          onChange={setInputValue}
          onKeyEnterUp={refreshResult}
        />
        {isExpanded ? (
          <SearchInput
            placeholder="Replace not implemented yet"
            value=""
            onChange={() => {}}
            onKeyEnterUp={() => {}}
          />
        ) : null}
      </VStack>
    </div>
  )
}

export default SearchWidgetContainer
