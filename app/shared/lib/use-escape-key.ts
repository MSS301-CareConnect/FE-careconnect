import { useEffect, useRef } from 'react'

/** Calls `onEscape` when Escape is pressed anywhere on the page while `active` (an open drawer, menu or panel). */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const handler = useRef(onEscape)
  useEffect(() => {
    handler.current = onEscape
  })

  useEffect(() => {
    if (!active) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler.current()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [active])
}
