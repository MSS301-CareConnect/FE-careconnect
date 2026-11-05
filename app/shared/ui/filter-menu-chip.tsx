import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Icon } from './icon'
import { popoverAttribute, popoverPanelClass, useAnchoredPopover } from './use-anchored-popover'

export interface FilterMenuOption {
  value: string
  label: string
}

/**
 * FilterChip: a chip that shows its current choice ("Gender: Female") and opens a small popover of options. It looks
 * active when the value differs from the default, so a glance tells which filters apply. The options open in the top
 * layer, so cards and `overflow` containers below the toolbar never cover them.
 */
export function FilterMenuChip({
  label,
  options,
  value,
  defaultValue = '',
  onChange,
  icon,
  showValue = false
}: {
  label: string
  options: FilterMenuOption[]
  value: string
  defaultValue?: string
  onChange: (value: string) => void
  icon?: string
  /** Show "Label: choice" even when the default is chosen (e.g. a date range that always applies). */
  showValue?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = options.find((option) => option.value === value)
  const active = value !== defaultValue

  const dismiss = useCallback(() => setOpen(false), [])
  const side = useAnchoredPopover({ open, anchorRef: buttonRef, panelRef, rootRef, onDismiss: dismiss, gap: 8 })

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus({ preventScroll: true })
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className='relative' ref={rootRef}>
      <button
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup='true'
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? 'border-primary bg-brand-50 text-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300'}`}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        {icon ? <Icon className='text-lg' name={icon} /> : null}
        <span>
          {label}
          {(active || showValue) && current ? `: ${current.label}` : ''}
        </span>
        <Icon className={`text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`} name='expand_more' />
      </button>
      {open ? (
        <div
          aria-label={label}
          className={`${popoverPanelClass} cc-scale-in min-w-48 rounded-xl p-1.5 ${side === 'top' ? 'origin-bottom-left' : 'origin-top-left'}`}
          id={listId}
          popover={popoverAttribute}
          ref={panelRef}
          role='menu'
        >
          {options.map((option) => {
            const checked = option.value === value
            return (
              <button
                aria-checked={checked}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${checked ? 'bg-brand-50 font-semibold text-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                  buttonRef.current?.focus()
                }}
                role='menuitemradio'
                type='button'
              >
                {option.label}
                {checked ? <Icon className='text-lg' name='check' /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/** "Filtering: Female × · ≥ 5 years × · Clear all" — each active filter removable on its own. */
export function ActiveFilters({
  label,
  clearLabel,
  removeLabel,
  items,
  onClear
}: {
  label: string
  clearLabel: string
  removeLabel: (item: string) => string
  items: { id: string; label: string; onRemove: () => void }[]
  onClear: () => void
}) {
  if (items.length === 0) return null
  return (
    <div className='flex flex-wrap items-center gap-2 text-sm'>
      <span className='text-on-surface-variant'>{label}</span>
      {items.map((item) => (
        <span
          className='cc-scale-in inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pr-1 pl-3 font-medium text-primary'
          key={item.id}
        >
          {item.label}
          <button
            aria-label={removeLabel(item.label)}
            className='grid h-6 w-6 place-items-center rounded-full hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={item.onRemove}
            type='button'
          >
            <Icon className='text-base' name='close' />
          </button>
        </span>
      ))}
      <button className='font-medium text-primary underline-offset-2 hover:underline' onClick={onClear} type='button'>
        {clearLabel}
      </button>
    </div>
  )
}
