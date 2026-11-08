import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from './button'
import { Icon } from './icon'

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

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  if (!open) return null

  const requestClose = () => {
    if (beforeClose && !beforeClose()) return
    dialogRef.current?.close()
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%_-_2rem)] ${size ? SIZE_CLASSES[size] : maxWidthClass} rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-0 text-on-surface shadow-xl backdrop:bg-on-surface/55`}
      onCancel={(event) => {
        // Escape: the browser closes the dialog unless the guard keeps it open.
        if (beforeClose && !beforeClose()) event.preventDefault()
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
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4 sm:px-6'>
          <div>
            <h2 className='text-lg font-bold text-on-surface' id={titleId}>
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
            className='grid h-9 w-9 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
            onClick={requestClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        {children ? <div className='min-h-0 overflow-y-auto p-5 text-sm sm:p-6'>{children}</div> : null}
        {footer ? (
          <div className='flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-outline-variant/40 bg-surface-container-low px-5 py-3.5 sm:px-6'>
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
