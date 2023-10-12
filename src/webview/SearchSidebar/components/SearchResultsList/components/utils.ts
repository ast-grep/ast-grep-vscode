import { MyPrismTheme } from '../utils/codeHighlightThemes'
export const getIconButtonProps = (themeBackgroundColor: string) => {
  return {
    variant: 'ghost',
    height: 'auto',
    minWidth: '18px',
    width: '18px',
    minHeight: '18px',
    _hover: { background: themeBackgroundColor },
    _active: { background: themeBackgroundColor },
    size: 'sm',
  }
}

export const groupHeaderHeight = '30px'

export const getBorderColor = (
  isDarkTheme: boolean,
  isFocused: boolean,
  theme: MyPrismTheme,
) => {
  if (isDarkTheme && !isFocused) {
    return theme.plain.backgroundColor
  }

  if (!isDarkTheme && !isFocused) {
    return 'gray.300'
  }

  return 'blue.200'
}
