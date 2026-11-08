import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { popoverAttribute, popoverPanelClass, useAnchoredPopover } from '~/shared/ui/use-anchored-popover'

/**
 * Bottom bar for the page's main action on phones, inside thumb reach and above the tab bar. From `lg` it becomes an
 * ordinary inline row.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className='fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-outline-variant bg-surface-container-lowest/95 px-4 py-3 shadow-[0_-6px_20px_-12px_rgb(16_24_20/0.25)] backdrop-blur lg:static lg:z-auto lg:mt-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none'>
      <div className='mx-auto flex max-w-[1080px] flex-wrap items-center gap-2 [&>*]:flex-1 lg:[&>*]:flex-none'>
        {children}
      </div>
    </div>
  )
}

/** A check mark that draws itself; shown after accepting, starting or finishing a visit. */
export function SuccessCheck({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center gap-2 py-2 text-center' role='status'>
      <span className='cg-pop grid h-14 w-14 place-items-center rounded-full bg-success-container text-success'>
        <svg aria-hidden='true' className='h-8 w-8' fill='none' viewBox='0 0 24 24'>
          <path
            className='cg-check-draw'
            d='M5 12.5l4.5 4.5L19 7.5'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2.5'
          />
        </svg>
      </span>
      <p className='font-semibold text-on-surface'>{label}</p>
    </div>
  )
}

export interface MenuAction {
  key: string
  label: string
  icon: string
  onSelect: () => void
  danger?: boolean
}

/**
 * The "⋯" menu for secondary actions of a card or page. The menu opens in the browser top layer next to its button
 * (below, or above when there is more room there), so the next card or an `overflow` container never covers it.
 */
export function OverflowMenu({ actions, label }: { actions: MenuAction[]; label?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const dismiss = useCallback(() => setOpen(false), [])
  const side = useAnchoredPopover({
    open,
    anchorRef: buttonRef,
    panelRef,
    rootRef,
    onDismiss: dismiss,
    align: 'end',
    gap: 4
  })

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true })
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function onMenuKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const entries = [...(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    const index = entries.findIndex((entry) => entry === document.activeElement)
    const next =
      event.key === 'ArrowDown' ? (index + 1) % entries.length : (index - 1 + entries.length) % entries.length
    entries[next]?.focus({ preventScroll: true })
  }

  if (actions.length === 0) return null
  return (
    <div className='relative' ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label={label ?? t('caregiver.ui.actions.more')}
        className='cg-press grid h-11 w-11 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <Icon name='more_horiz' />
      </button>
      {open ? (
        <div
          aria-label={label ?? t('caregiver.ui.actions.more')}
          className={`${popoverPanelClass} cg-pop w-56 rounded-xl p-1.5 shadow-[var(--cg-shadow-2)] ${side === 'top' ? 'origin-bottom-right' : 'origin-top-right'}`}
          id={menuId}
          onKeyDown={onMenuKey}
          popover={popoverAttribute}
          ref={panelRef}
          role='menu'
        >
          {actions.map((action) => (
            <button
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${action.danger ? 'text-error hover:bg-error-container/60' : 'text-on-surface hover:bg-surface-container-low'}`}
              key={action.key}
              onClick={() => {
                setOpen(false)
                action.onSelect()
              }}
              role='menuitem'
              tabIndex={-1}
              type='button'
            >
              <Icon className='text-lg' name={action.icon} />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
