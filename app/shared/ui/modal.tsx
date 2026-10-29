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
  onClose: () => void
}

export function Modal({ open, title, description, children, footer, maxWidthClass = 'max-w-lg', onClose }: ModalProps) {
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

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%_-_2rem)] ${maxWidthClass} rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-0 text-on-surface shadow-xl backdrop:bg-on-surface/55`}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          dialogRef.current?.close()
        }
      }}
      ref={dialogRef}
    >
      <div className='flex items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4 sm:px-6'>
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
          onClick={() => dialogRef.current?.close()}
          type='button'
        >
          <Icon name='close' />
        </button>
      </div>
      {children ? <div className='p-5 text-sm sm:p-6'>{children}</div> : null}
      {footer ? (
        <div className='flex flex-wrap items-center justify-end gap-2.5 border-t border-outline-variant/40 bg-surface-container-low px-5 py-3.5 sm:px-6'>
          {footer}
        </div>
      ) : null}
    </dialog>
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
