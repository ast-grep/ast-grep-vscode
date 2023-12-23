import { PrismTheme } from 'prism-react-renderer'
import githubTheme from 'prism-react-renderer/themes/github'
import nightOwlTheme from 'prism-react-renderer/themes/nightOwl'

export type MyPrismTheme = PrismTheme & {
  plain: PrismTheme['plain'] & {
    backgroundColor: string
  }
}

nightOwlTheme.plain.backgroundColor = 'rgb(45, 45, 45)'

githubTheme.plain.backgroundColor = '#f6f8fa'

export const darkTheme = nightOwlTheme as MyPrismTheme

export const lightTheme = githubTheme as MyPrismTheme
