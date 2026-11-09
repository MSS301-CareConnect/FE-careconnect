import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { Icon } from './icon'
import { popoverAttribute, popoverPanelClass, useAnchoredPopover } from './use-anchored-popover'
import { useExitPresence } from '~/shared/lib/use-exit-presence'

export interface ActionMenuItem {
  id: string
  label: string
  icon?: string
  /** Destructive actions ("Cancel booking", "Delete") are drawn in red. */
  tone?: 'default' | 'danger'
  onSelect: () => void
}

/**
 * The "⋯" button that holds secondary actions of a page or card. Arrow keys move between items, Escape and a click
 * outside close it and return focus to the button. The menu opens in the top layer so tables and overflow containers
 * never clip it.
 */
export function ActionMenu({
  label,
  items,
  align = 'end',
  className = ''
}: {
  /** Accessible name of the "⋯" button, e.g. "More actions". */
  label: string
  items: ActionMenuItem[]
  align?: 'start' | 'end'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const dismiss = useCallback(() => setOpen(false), [])
  const { present, state: panelState } = useExitPresence(open)
  const side = useAnchoredPopover({
    open: present,
    anchorRef: buttonRef,
    panelRef,
    rootRef,
    onDismiss: dismiss,
    align,
    gap: 6
  })

  useEffect(() => {
    if (!open) return
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const entries = [...(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    const index = entries.findIndex((entry) => entry === document.activeElement)
    const next =
      event.key === 'ArrowDown' ? (index + 1) % entries.length : (index - 1 + entries.length) % entries.length
    entries[next]?.focus({ preventScroll: true })
  }

  if (items.length === 0) return null
  const originClass =
    side === 'top'
      ? align === 'end'
        ? 'origin-bottom-right'
        : 'origin-bottom-left'
      : align === 'end'
        ? 'origin-top-right'
        : 'origin-top-left'

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label={label}
        className='grid h-10 w-10 place-items-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <Icon className='text-xl' name='more_horiz' />
      </button>
      {present ? (
        <div
          aria-label={label}
          className={`${popoverPanelClass} cc-dropdown min-w-52 p-1.5 ${originClass}`}
          data-side={side}
          data-state={panelState}
          id={menuId}
          onKeyDown={onMenuKey}
          popover={popoverAttribute}
          ref={panelRef}
          role='menu'
        >
          {items.map((item) => (
            <button
              className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${item.tone === 'danger' ? 'text-error hover:bg-error-container/50' : 'text-on-surface hover:bg-surface-container-low'}`}
              key={item.id}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              role='menuitem'
              tabIndex={-1}
              type='button'
            >
              {item.icon ? <Icon className='text-lg' name={item.icon} /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
