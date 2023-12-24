import { MyPrismTheme } from '../utils/codeHighlightThemes'

export const getIconButtonProps = (themeBackgroundColor: string) => {
  return {
    height: 'auto',
    minWidth: '18px',
    width: '18px',
    minHeight: '18px',
    size: 'sm',
    outline: 'none'
  }
}

export const groupHeaderHeight = '30px'

export const getBorderColor = (
  isDarkTheme: boolean,
  isFocused: boolean,
  theme: MyPrismTheme
) => {
  if (isDarkTheme && !isFocused) {
    return theme.plain.backgroundColor
  }

  if (!isDarkTheme && !isFocused) {
    return 'gray.300'
  }

  return 'blue.200'
}
