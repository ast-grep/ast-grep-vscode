import { IconButton, Tooltip } from '@chakra-ui/react'
import { MdContentCopy } from 'react-icons/md'
import { darkTheme, lightTheme } from '../utils/codeHighlightThemes'
import { useThemeType } from '../hooks/useThemeType'
import { getIconButtonProps } from './utils'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

type CopyPathProps = {
  fullFilePath: string
}

export function CopyPath({ fullFilePath }: CopyPathProps) {
  const themeType = useThemeType()
  const isDarkTheme = themeType === 'dark'
  const highlightTheme = isDarkTheme ? darkTheme : lightTheme

  const iconButtonStyleResetProps = getIconButtonProps(
    highlightTheme.plain.backgroundColor,
  )
  const [hasCopiedFilePath, copyFilePath] = useCopyToClipboard(fullFilePath)

  return (
    <>
      <IconButton
        aria-label="copy file path"
        icon={<MdContentCopy />}
        {...iconButtonStyleResetProps}
        onClick={copyFilePath}
      />
      {hasCopiedFilePath && (
        <Tooltip label="Copied to clipboard!" defaultIsOpen={true}>
          <span />
        </Tooltip>
      )}
    </>
  )
}
