import { useEffect, useRef } from 'react'
import { useBoolean } from 'react-use'

export function useStickyShadow(root?: HTMLElement | null) {
  const [isScrolled, setScrolled] = useBoolean(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setScrolled(false)
        } else {
          setScrolled(true)
        }
      },
      { root },
    )
    observer.observe(ref.current!)
    return () => {
      observer.disconnect()
    }
  })
  return {
    isScrolled,
    ref,
  }
}
