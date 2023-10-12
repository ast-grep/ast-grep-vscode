import { useState, useEffect, createContext, useContext } from 'react'

const themeAttr = 'data-vscode-theme-kind'

const getThemeType = (body: HTMLBodyElement) => {
  const newThemeType = body.getAttribute(themeAttr)

  return newThemeType?.includes('light') ? 'light' : 'dark'
}

type ThemeType = 'dark' | 'light'

const themeTypeContext = createContext<ThemeType>('dark')

const { Provider, Consumer } = themeTypeContext

export const ThemeTypeProvider = (props: { children: React.ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light')

  useEffect(() => {
    setThemeType(getThemeType(document.body as HTMLBodyElement))

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(mutation => {
        const newThemeType = getThemeType(mutation.target as HTMLBodyElement)

        setThemeType(newThemeType)
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [themeAttr]
    })
  }, [])

  return <Provider value={themeType} {...props} />
}

export const useThemeType = () => {
  return useContext(themeTypeContext)
}

export const ThemeTypeConsumer = Consumer
