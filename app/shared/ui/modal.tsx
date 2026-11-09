import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { canAnimate, useExitPresence } from '../lib/use-exit-presence'
import { Button } from './button'
import { Icon } from './icon'
import './dialog-motion.css'

/** Length of the `cc-modal-out` animation in dialog-motion.css. */
const CLOSE_MS = 150

export interface ModalProps {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  maxWidthClass?: string
  /**
   * Standard widths (take precedence over maxWidthClass): sm 28rem, md 32rem, lg 42rem, xl 56rem (forms laid out in
   * two columns), 2xl 72rem.
   */
  size?: ModalSize
  /** Forms pass false so a stray click outside does not throw away what was typed. */
  dismissOnBackdrop?: boolean
  /**
   * Called before the dialog closes from the close button, Escape or the backdrop; return false to keep it open (for
   * example to ask before throwing away unsaved changes).
   */
  beforeClose?: () => boolean
  onClose: () => void
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl'
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  maxWidthClass = 'max-w-lg',
  size,
  dismissOnBackdrop = true,
  beforeClose,
  onClose
}: ModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  // Stays mounted for the close animation when the caller sets `open` to false (`data-state='closed'`).
  const { present, state } = useExitPresence(open, CLOSE_MS + 20)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    // While closing, the dialog stays open for its exit animation; unmounting removes it from the top layer.
  }, [open])

  if (!present) return null

  const requestClose = () => {
    if (beforeClose && !beforeClose()) return
    const dialog = dialogRef.current
    if (!dialog) return
    if (!canAnimate()) {
      dialog.close()
      return
    }
    // Play the exit, then close: the close event reaches `onClose` once the dialog has left.
    dialog.dataset.state = 'closed'
    window.setTimeout(() => dialog.close(), CLOSE_MS)
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`cc-modal m-auto w-[calc(100%_-_2rem)] ${size ? SIZE_CLASSES[size] : maxWidthClass} rounded-[1.75rem] border border-white/70 bg-surface-container-lowest p-0 text-on-surface shadow-[var(--shadow-float)]`}
      data-state={state}
      onCancel={(event) => {
        // Escape: closed through the same guarded, animated path as the close button.
        event.preventDefault()
        requestClose()
      }}
      onClose={onClose}
      onMouseDown={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) {
          requestClose()
        }
      }}
      ref={dialogRef}
    >
      <div className='flex max-h-[min(90dvh,calc(100dvh-2rem))] flex-col'>
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4 sm:px-7 sm:py-5'>
          <div>
            <h2 className='text-xl font-bold tracking-tight text-forest-950' id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className='mt-1 text-sm leading-6 text-on-surface-variant' id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label={t('common.ui.closeDialog')}
            className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-container-low text-on-surface-variant transition-[background-color,color,transform] duration-200 hover:rotate-90 hover:bg-mint-100 hover:text-forest-900 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={requestClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        {children ? <div className='min-h-0 overflow-y-auto p-5 text-sm sm:px-7 sm:py-6'>{children}</div> : null}
        {footer ? (
          <div className='flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-outline-variant/40 bg-mint-50/60 px-5 py-4 sm:px-7'>
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  )
}

/**
 * Two columns inside a Modal body from `lg` (main content, then a side column such as a live summary); one column on
 * smaller screens with the side column after the main one.
 */
export function ModalColumns({
  children,
  side,
  sideClassName = 'lg:w-80'
}: {
  children: ReactNode
  side: ReactNode
  sideClassName?: string
}) {
  return (
    <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
      <div className='min-w-0 flex-1'>{children}</div>
      <div className={`min-w-0 shrink-0 lg:sticky lg:top-0 ${sideClassName}`}>{side}</div>
    </div>
  )
}

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  tone?: 'primary' | 'danger'
  loading?: boolean
  error?: string
  children?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  tone,
  loading = false,
  error,
  children,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const isDanger = tone ? tone === 'danger' : danger

  return (
    <Modal
      description={description}
      footer={
        <>
          <Button disabled={loading} onClick={onClose} size='md' variant='outline'>
            {cancelLabel ?? t('common.ui.cancel')}
          </Button>
          <Button
            loading={loading}
            loadingLabel={t('common.ui.working')}
            onClick={onConfirm}
            size='md'
            variant={isDanger ? 'danger' : 'primary'}
          >
            {confirmLabel ?? t('common.ui.confirm')}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title={title}
    >
      {children || error ? (
        <div className='space-y-3'>
          {children}
          {error ? (
            <p className='rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container' role='alert'>
              {error}
            </p>
          ) : null}
        </div>
      ) : undefined}
    </Modal>
  )
}
