import { useCallback, type MouseEvent } from 'react'
import { useLocation } from 'react-router'

/** Scrolls the window back to the top smoothly (instantly when the user asked for reduced motion). */
export function scrollToTopSmoothly() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

/**
 * For navigation links (logo, header tabs, bottom bar, footer): a plain click on the link of the page that is already
 * open glides back to the top instead of navigating again — a same-URL navigation makes `ScrollRestoration` jump to
 * the top in one frame, which reads as a stutter on the long landing page (2026-11-09). Links to another page, and
 * modified clicks (new tab, new window), behave as before.
 */
export function useScrollTopOnSamePage() {
  const { pathname, search } = useLocation()

  return useCallback(
    (to: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = new URL(to, window.location.href)
      if (target.pathname !== pathname || target.search !== search) return
      event.preventDefault()
      scrollToTopSmoothly()
    },
    [pathname, search]
  )
}
