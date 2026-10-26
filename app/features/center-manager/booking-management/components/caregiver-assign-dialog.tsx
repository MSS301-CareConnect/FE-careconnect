import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export interface CaregiverAssignDialogProps {
  title: string
  description: string
  confirmLabel: string
  options: { id: string; name: string }[]
  loading: boolean
  /** Accepting a booking that already has a caregiver may keep it, so the choice is optional there. */
  optional?: boolean
  currentId?: string
  pending: boolean
  error?: string
  onConfirm: (caregiverId: string | undefined) => void
  onClose: () => void
}

export function CaregiverAssignDialog({
  title,
  description,
  confirmLabel,
  options,
  loading,
  optional = false,
  currentId,
  pending,
  error,
  onConfirm,
  onClose
}: CaregiverAssignDialogProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const fieldId = useId()
  const [caregiverId, setCaregiverId] = useState(optional ? '' : (currentId ?? ''))
  const valid = optional || (caregiverId !== '' && caregiverId !== currentId)

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
          if (valid && !pending) onConfirm(caregiverId || undefined)
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
          <p className='leading-6 text-on-surface-variant'>{description}</p>
          <div>
            <label className='font-semibold' htmlFor={fieldId}>
              {t('centerManager.bookingDetail.assign.caregiver')}
            </label>
            <select
              className='mt-2 w-full rounded-lg border border-outline-variant/60 bg-white p-3 focus:border-primary focus:outline-none'
              disabled={loading}
              id={fieldId}
              onChange={(event) => setCaregiverId(event.target.value)}
              value={caregiverId}
            >
              <option value=''>
                {optional
                  ? t('centerManager.bookingDetail.assign.keep')
                  : t('centerManager.bookingDetail.assign.choose')}
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.id === currentId ? ` (${t('centerManager.bookingDetail.assign.current')})` : ''}
                </option>
              ))}
            </select>
            {loading ? (
              <p className='mt-1 text-xs text-on-surface-variant'>{t('centerManager.bookingDetail.assign.loading')}</p>
            ) : null}
            {!loading && options.length === 0 ? (
              <p className='mt-1 text-xs text-on-surface-variant'>{t('centerManager.bookingDetail.assign.empty')}</p>
            ) : null}
          </div>
          <p className='text-xs text-on-surface-variant'>{t('centerManager.bookingDetail.assign.availabilityHint')}</p>
          {error ? (
            <p className='rounded-lg bg-error-container/40 p-3 text-error' role='alert'>
              {error}
            </p>
          ) : null}
        </div>
        <div className='flex justify-end gap-2 bg-surface-container-low p-4'>
          <button
            className='rounded-lg bg-white px-4 py-2 text-sm font-semibold hover:bg-surface-container'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            {t('booking.actions.back')}
          </button>
          <button
            className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-50'
            disabled={!valid || pending}
            type='submit'
          >
            {pending ? t('booking.actions.working') : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}
