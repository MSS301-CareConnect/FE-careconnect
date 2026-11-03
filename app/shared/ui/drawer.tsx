import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

export interface DrawerProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  /** `side` slides in from the right (a bottom sheet below `sm`); `bottom` is always a bottom sheet. */
  placement?: 'side' | 'bottom'
}

/**
 * Drawer on a native modal `<dialog>`: focus is trapped and Escape closes it. It slides from the right on wide
 * screens and up from the bottom on phones.
 */
export function Drawer({ open, title, description, children, footer, onClose, placement = 'side' }: DrawerProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  if (!open) return null
  const side = placement === 'side'

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`m-0 open:flex max-h-none max-w-none flex-col border-outline-variant bg-surface-container-lowest p-0 text-on-surface shadow-2xl ${side ? 'cc-sheet cc-side top-auto bottom-0 h-[88dvh] w-full rounded-t-2xl sm:top-0 sm:right-0 sm:left-auto sm:h-dvh sm:w-[min(30rem,100vw)] sm:rounded-none sm:border-l' : 'cc-sheet top-auto bottom-0 max-h-[88dvh] w-full rounded-t-2xl'}`}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) ref.current?.close()
      }}
      ref={ref}
    >
      <div className='flex items-start justify-between gap-3 border-b border-outline-variant px-5 py-4'>
        <div className='min-w-0'>
          <h2 className='text-lg font-semibold text-on-surface' id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className='mt-0.5 text-sm text-on-surface-variant' id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        <button
          aria-label={t('common.kit.closePanel')}
          className='grid h-10 w-10 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => ref.current?.close()}
          type='button'
        >
          <Icon name='close' />
        </button>
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto px-5 py-5'>{children}</div>
      {footer ? (
        <div className='flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-5 py-3'>
          {footer}
        </div>
      ) : null}
    </dialog>
  )
}
