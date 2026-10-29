import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export interface BookingReasonDialogProps {
  title: string
  label: string
  confirmLabel: string
  description?: string
  /** Characters the backend requires, e.g. 10 for a no-show note. */
  minLength?: number
  maxLength?: number
  danger?: boolean
  pending?: boolean
  error?: string
  /** Optional content between the description and the reason field, such as a refund preview. */
  children?: ReactNode
  /** False keeps the confirm button disabled while extra content is not ready. */
  canConfirm?: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Modal that collects the reason BookingService requires for reject, cancel, force-end and no-show actions. */
export function BookingReasonDialog({
  title,
  label,
  confirmLabel,
  description,
  minLength = 1,
  maxLength = 1000,
  danger = false,
  pending = false,
  error,
  children,
  canConfirm = true,
  onConfirm,
  onClose
}: BookingReasonDialogProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const fieldId = useId()
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const valid = trimmed.length >= minLength && trimmed.length <= maxLength

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog
      aria-labelledby={titleId}
      className='m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-0 text-on-surface shadow-xl backdrop:bg-on-surface/55'
      onClose={onClose}
      ref={dialog}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (valid && canConfirm && !pending) onConfirm(trimmed)
        }}
      >
        <div className='flex items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4'>
          <h2 className='text-lg font-bold text-on-surface' id={titleId}>
            {title}
          </h2>
          <button
            aria-label={t('booking.actions.close')}
            className='grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <div className='space-y-4 p-5 text-sm'>
          {description ? <p className='leading-6 text-on-surface-variant'>{description}</p> : null}
          {children}
          <div>
            <label className='font-semibold text-on-surface' htmlFor={fieldId}>
              {label}
            </label>
            <textarea
              className='mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
              id={fieldId}
              maxLength={maxLength}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={3}
              value={reason}
            />
            {minLength > 1 ? (
              <p className='mt-1 text-xs text-on-surface-variant'>
                {t('booking.dialog.minLength', { count: minLength })}
              </p>
            ) : null}
          </div>
          {error ? (
            <p className='rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container' role='alert'>
              {error}
            </p>
          ) : null}
        </div>
        <div className='flex justify-end gap-2.5 border-t border-outline-variant/40 bg-surface-container-low p-4'>
          <button
            className='min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            {t('booking.actions.back')}
          </button>
          <button
            aria-busy={pending || undefined}
            className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${danger ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary-container'}`}
            disabled={!valid || !canConfirm || pending}
            type='submit'
          >
            {pending ? t('booking.actions.working') : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}
