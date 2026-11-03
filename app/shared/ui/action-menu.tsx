import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { Icon } from './icon'

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
 * outside close it and return focus to the button.
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
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const entries = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    const index = entries.findIndex((entry) => entry === document.activeElement)
    const next =
      event.key === 'ArrowDown' ? (index + 1) % entries.length : (index - 1 + entries.length) % entries.length
    entries[next]?.focus()
  }

  if (items.length === 0) return null
  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label={label}
        className='grid h-11 w-11 place-items-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <Icon className='text-xl' name='more_horiz' />
      </button>
      {open ? (
        <div
          aria-label={label}
          className={`cc-scale-in absolute top-full z-30 mt-2 min-w-52 rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-[var(--shadow-raised)] ${align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
          id={menuId}
          onKeyDown={onMenuKey}
          role='menu'
        >
          {items.map((item) => (
            <button
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${item.tone === 'danger' ? 'text-error hover:bg-error-container/50' : 'text-on-surface hover:bg-surface-container-low'}`}
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
