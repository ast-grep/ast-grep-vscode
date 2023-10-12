import { useCallback, MutableRefObject } from 'react'

export const usePreventScrollJump = (
  wrapperRef: MutableRefObject<HTMLDivElement | null>,
  headingRef: MutableRefObject<HTMLDivElement | null>,
  scrollElRef: MutableRefObject<HTMLDivElement | null>,
) => {
  return useCallback(() => {
    if (wrapperRef.current && headingRef.current && scrollElRef.current) {
      const wrapperTop = wrapperRef.current.getBoundingClientRect().top
      const headingTop = headingRef.current.getBoundingClientRect().top

      const headingStickyTop = window.getComputedStyle(headingRef.current).top
      const isHeadingSticky = wrapperTop < headingTop

      if (isHeadingSticky) {
        wrapperRef.current.scrollIntoView({
          block: 'start',
        })

        // Correct position for nested sticky headers
        scrollElRef.current.scrollBy({
          top: -parseInt(headingStickyTop),
        })
      }
    }
  }, [])
}
