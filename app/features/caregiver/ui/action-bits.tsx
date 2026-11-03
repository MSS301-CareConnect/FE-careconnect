import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

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

/** The "⋯" menu for secondary actions of a card or page. */
export function OverflowMenu({ actions, label }: { actions: MenuAction[]; label?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
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

  if (actions.length === 0) return null
  return (
    <div className='relative' ref={rootRef}>
      <button
        aria-controls={menuId}
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
          className='cg-pop absolute top-full right-0 z-40 mt-1 w-56 origin-top-right rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-[var(--cg-shadow-2)]'
          id={menuId}
          role='menu'
        >
          {actions.map((action) => (
            <button
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${action.danger ? 'text-error hover:bg-error-container/60' : 'text-on-surface hover:bg-surface-container-low'}`}
              key={action.key}
              onClick={() => {
                setOpen(false)
                action.onSelect()
              }}
              role='menuitem'
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
