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
      className='m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-2xl bg-white p-0 text-on-surface shadow-xl backdrop:bg-on-surface/55'
      onClose={onClose}
      ref={dialog}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (valid && canConfirm && !pending) onConfirm(trimmed)
        }}
      >
        <div className='flex items-start justify-between gap-3 p-5 pb-0'>
          <h2 className='text-lg font-bold' id={titleId}>
            {title}
          </h2>
          <button
            aria-label={t('booking.actions.close')}
            className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
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
            <label className='font-semibold' htmlFor={fieldId}>
              {label}
            </label>
            <textarea
              className='mt-2 w-full rounded-lg border border-outline-variant/60 bg-white p-3 font-normal focus:border-primary focus:outline-none'
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
            <p className='rounded-lg bg-error-container/40 p-3 text-sm text-error' role='alert'>
              {error}
            </p>
          ) : null}
        </div>
        <div className='flex justify-end gap-2 bg-surface-container-low p-4'>
          <button
            className='rounded-lg bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            {t('booking.actions.back')}
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${danger ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary-container'}`}
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
