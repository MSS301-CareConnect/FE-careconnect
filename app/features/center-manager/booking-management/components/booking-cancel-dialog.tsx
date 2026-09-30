import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'

export function BookingCancelDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return (
    <dialog
      aria-labelledby='manager-cancel-title'
      className='m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-2xl bg-white p-0 text-on-surface shadow-xl backdrop:bg-on-surface/55'
      onClose={onClose}
      ref={dialog}
    >
      <div className='flex items-start justify-between gap-3 border-b border-outline-variant/25 p-5'>
        <div className='flex items-center gap-2'>
          <Icon className='text-error' name='warning' />
          <h2 className='text-lg font-bold' id='manager-cancel-title'>
            {t('centerManager.bookingDetail.cancelTitle', { id })}
          </h2>
        </div>
        <button
          aria-label={t('centerManager.bookingDetail.close')}
          className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          <Icon name='close' />
        </button>
      </div>
      <div className='space-y-4 p-5 text-sm'>
        <p className='rounded-lg bg-error-container/40 p-3 leading-6 text-on-surface-variant'>
          {t('centerManager.bookingDetail.cancelHint')}
        </p>
        <label className='block font-semibold'>
          {t('centerManager.bookingDetail.cancelReason')}
          <select
            className='mt-2 w-full rounded-lg border border-outline-variant/60 bg-white p-3 font-normal'
            defaultValue='hospital'
          >
            {(['hospital', 'plan', 'caregiver', 'other'] as const).map((reason) => (
              <option key={reason} value={reason}>
                {t(`centerManager.bookingDetail.reasons.${reason}`)}
              </option>
            ))}
          </select>
        </label>
        <div className='rounded-lg bg-surface-container-low p-4'>
          <h3 className='font-bold'>{t('centerManager.bookingDetail.cancellation')}</h3>
          <ul className='mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-on-surface-variant'>
            {(['policyEarly', 'policyNear', 'policyActive'] as const).map((item) => (
              <li key={item}>{t(`centerManager.bookingDetail.${item}`)}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className='flex justify-end gap-2 border-t border-outline-variant/25 bg-surface-container-low p-4'>
        <button
          className='rounded-lg border border-outline-variant/60 bg-white px-4 py-2 text-sm font-semibold'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          {t('centerManager.bookingDetail.close')}
        </button>
        <button
          className='cursor-not-allowed rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white opacity-55'
          disabled
          title={t('centerManager.bookingDetail.unavailable')}
          type='button'
        >
          {t('centerManager.bookingDetail.cancelConfirm')}
        </button>
      </div>
    </dialog>
  )
}
