import { useEffect, useState } from 'react'

/** Length of the `.cc-dropdown` close animation in app.css, plus a little slack. */
const EXIT_MS = 160

function canAnimate() {
  if (import.meta.env.MODE === 'test' || typeof window === 'undefined') return false
  return !(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

/**
 * Keeps a dropdown panel mounted for its close animation (2026-11-09). `present` says whether to render the panel and
 * `state` goes on it as `data-state` so `.cc-dropdown` plays the open or the close animation. Under reduced motion and
 * in tests the panel unmounts at once, exactly as before.
 */
export function useExitPresence(open: boolean, duration = EXIT_MS) {
  const [closing, setClosing] = useState(false)
  const [previous, setPrevious] = useState(open)

  // Adjusting state while rendering (React's "storing information from previous renders" pattern): a close starts the
  // exit, a reopen cancels it.
  if (previous !== open) {
    setPrevious(open)
    setClosing(!open && canAnimate())
  }

  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => setClosing(false), duration)
    return () => window.clearTimeout(timer)
  }, [closing, duration])

  return { present: open || closing, state: open ? ('open' as const) : ('closed' as const) }
}
