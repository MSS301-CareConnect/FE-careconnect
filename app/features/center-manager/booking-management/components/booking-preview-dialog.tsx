import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import type { ManagerBookingPreview } from '../booking-preview'

export function BookingPreviewDialog({ booking, onClose }: { booking: ManagerBookingPreview; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${booking.date}T00:00:00Z`))
  return (
    <dialog
      aria-labelledby='manager-booking-preview-title'
      className='m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-on-surface shadow-xl backdrop:bg-on-surface/55'
      onClose={onClose}
      ref={dialog}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-bold' id='manager-booking-preview-title'>
            {t('centerManager.bookingManagement.detailTitle', { id: booking.id })}
          </h2>
          <p className='mt-2 text-xs text-outline'>{t('centerManager.bookingManagement.detailHint')}</p>
        </div>
        <button
          aria-label={t('centerManager.bookingManagement.close')}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          <Icon name='close' />
        </button>
      </div>
      <dl className='mt-6 grid gap-4 sm:grid-cols-2'>
        {[
          { label: t('centerManager.bookingManagement.customer'), value: booking.customer },
          { label: t('centerManager.bookingManagement.patient'), value: booking.patient },
          {
            label: t('centerManager.bookingManagement.caregiver'),
            value: booking.caregiver ?? t('centerManager.bookingManagement.unassigned')
          },
          { label: t('centerManager.bookingManagement.medicalService'), value: booking.serviceName },
          {
            label: t('centerManager.bookingManagement.appointment'),
            value: `${date}${booking.start && booking.end ? ` · ${booking.start}–${booking.end}` : ''}`
          },
          {
            label: t('centerManager.bookingManagement.status'),
            value: t(`centerManager.bookingManagement.statuses.${booking.status}`)
          }
        ].map((item) => (
          <div className='rounded-lg bg-surface-container-low p-3' key={item.label}>
            <dt className='text-xs text-outline'>{item.label}</dt>
            <dd className='mt-2 text-sm font-semibold'>{item.value}</dd>
          </div>
        ))}
      </dl>
      {booking.note && (
        <p className='mt-4 rounded-lg bg-surface-container-low p-3 text-sm'>
          {t('centerManager.bookingManagement.cancelledNote', { note: booking.note })}
        </p>
      )}
      <div className='mt-6 flex flex-wrap gap-2'>
        <Link
          className='flex-1 rounded-lg bg-primary p-3 text-center text-sm font-semibold text-white'
          to={`/center-manager/bookings/${booking.id}`}
        >
          {t('centerManager.bookingManagement.view', { id: booking.id })}
        </Link>
        <button
          className='rounded-lg bg-surface-container p-3 text-sm font-semibold'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          {t('centerManager.bookingManagement.close')}
        </button>
      </div>
    </dialog>
  )
}
