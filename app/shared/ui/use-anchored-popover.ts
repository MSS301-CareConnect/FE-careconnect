import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

const EDGE = 8

export type PopoverSide = 'top' | 'bottom'

/**
 * Places an open popover panel next to its anchor and keeps it there. The panel goes into the browser top layer
 * (`popover="manual"` + `showPopover()`), so a dialog or an `overflow` container never clips it, and it is positioned
 * with fixed coordinates: below the anchor, flipped above when there is more room there, and kept inside the
 * viewport. It follows scrolling and resizing, and a pointer press outside `rootRef` closes it. Without the Popover API
 * (older browsers, jsdom) the panel is still a fixed, high z-index layer.
 */
export function useAnchoredPopover({
  open,
  anchorRef,
  panelRef,
  rootRef,
  onDismiss,
  align = 'start',
  gap = 6
}: {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLElement | null>
  /** Presses inside this element (anchor + panel) do not close the panel. */
  rootRef: RefObject<HTMLElement | null>
  onDismiss: () => void
  align?: 'start' | 'end'
  gap?: number
}) {
  const [side, setSide] = useState<PopoverSide>('bottom')

  useLayoutEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    if (typeof panel.showPopover === 'function' && !panel.matches(':popover-open')) {
      try {
        panel.showPopover()
      } catch {
        // Not connected yet or already shown: the fixed layer still works.
      }
    }

    let frame = 0
    function place() {
      const anchor = anchorRef.current
      if (!anchor || !panel) return
      const rect = anchor.getBoundingClientRect()
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      const viewWidth = document.documentElement.clientWidth || window.innerWidth
      const viewHeight = window.innerHeight
      const below = viewHeight - rect.bottom - gap - EDGE
      const above = rect.top - gap - EDGE
      const flip = height > below && above > below
      const top = flip ? rect.top - gap - height : rect.bottom + gap
      const preferredLeft = align === 'end' ? rect.right - width : rect.left
      const left = Math.min(Math.max(EDGE, preferredLeft), Math.max(EDGE, viewWidth - width - EDGE))
      panel.style.top = `${Math.max(EDGE, Math.min(top, viewHeight - height - EDGE))}px`
      panel.style.left = `${left}px`
      setSide(flip ? 'top' : 'bottom')
    }
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }

    place()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { capture: true, passive: true })
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
    observer?.observe(panel)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, { capture: true })
      observer?.disconnect()
      if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
        try {
          panel.hidePopover()
        } catch {
          // Already hidden.
        }
      }
    }
  }, [open, anchorRef, panelRef, align, gap])

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onDismiss()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open, rootRef, onDismiss])

  return side
}

/**
 * `popover` attribute for the panel: `manual` where the Popover API exists. Without it the attribute is left off,
 * because an engine that knows the attribute but cannot show it (jsdom) would keep the panel hidden.
 */
export const popoverAttribute: 'manual' | undefined =
  typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype ? 'manual' : undefined

/** Classes for the panel element: fixed top-layer box that undoes the browser's default popover centring. */
export const popoverPanelClass =
  'fixed inset-auto z-50 m-0 overflow-visible rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface shadow-[var(--shadow-raised)]'

/**
 * Inside a `<label>`, a click on a non-interactive part of the panel would be forwarded to the labelled control and
 * reopen or retoggle it; cancelling the click stops that. Buttons in the panel are unaffected (type="button").
 */
export function stopLabelForwarding(event: { preventDefault: () => void }) {
  event.preventDefault()
}
