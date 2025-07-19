import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'

const BODY_DARK_ATTRIBUTE = 'data-vscode-theme-kind'

function getIsDark() {
  return document.body.getAttribute(BODY_DARK_ATTRIBUTE) === 'vscode-dark'
}

const UseDarkContext = createContext(true)

function useObserveDark() {
  const [isDark, setIsDark] = useState(getIsDark())
  useEffect(() => {
    const observer = new MutationObserver((mutationsList, _observer) => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === BODY_DARK_ATTRIBUTE) {
          setIsDark(() => getIsDark())
        }
      }
    })
    const config = { attributes: true, childList: false, subtree: false }
    observer.observe(document.body, config)
  }, [])
  return isDark
}

export const UseDarkContextProvider = ({ children }: PropsWithChildren) => {
  const isDark = useObserveDark()
  return <UseDarkContext.Provider value={isDark}>{children}</UseDarkContext.Provider>
}

export function useDark() {
  return useContext(UseDarkContext)
}
