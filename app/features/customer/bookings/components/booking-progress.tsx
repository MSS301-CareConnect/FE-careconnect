import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { BookingPreview } from '../bookings-data'

const steps = [
  { key: 'confirmed', icon: 'check' },
  { key: 'assigned', icon: 'person_check' },
  { key: 'checkIn', icon: 'how_to_reg' },
  { key: 'care', icon: 'medical_services' },
  { key: 'complete', icon: 'task_alt' }
] as const

const progressByStatus = { ongoing: 47, upcoming: 25, completed: 100, cancelled: 0 } as const
const activeStepByStatus = { ongoing: 3, upcoming: 1, completed: 4, cancelled: -1 } as const

interface BookingProgressProps {
  booking: BookingPreview
  date: string
}

export function BookingProgress({ booking, date }: BookingProgressProps) {
  const { t, i18n } = useTranslation()
  const progress = progressByStatus[booking.status]
  const activeStep = activeStepByStatus[booking.status]

  return (
    <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-progress-title'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 id='booking-progress-title' className='flex items-center gap-2 text-lg font-bold text-on-surface'>
            <Icon name='timeline' className='text-2xl text-primary' />
            {t('customer.bookingDetail.timeline.title')}
          </h2>
          <p className='mt-1 text-sm text-on-surface-variant'>
            {t('customer.bookingDetail.timeline.schedule')}: {date} · {booking.start}–{booking.end}
          </p>
        </div>
        <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary'>
          {t(`customer.bookingDetail.status.${booking.status}`)}
        </span>
      </div>

      {booking.status !== 'cancelled' && (
        <>
          <div className='mt-6 flex items-center justify-between text-sm font-semibold'>
            <span>{t('customer.bookingDetail.timeline.progress')}</span>
            <span className='text-primary'>
              {new Intl.NumberFormat(i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN', { style: 'percent' }).format(
                progress / 100
              )}
            </span>
          </div>
          <div
            role='progressbar'
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('customer.bookingDetail.timeline.progress')}
            className='mt-2 h-2.5 overflow-hidden rounded-full bg-surface-container'
          >
            <div className='h-full rounded-full bg-primary' style={{ width: `${progress}%` }} />
          </div>
          <ol className='mt-7 grid gap-4 sm:grid-cols-5 sm:gap-2'>
            {steps.map((step, index) => {
              const isReached = index <= activeStep
              const isCurrent = index === activeStep && booking.status !== 'completed'
              return (
                <li key={step.key} className='flex items-center gap-3 sm:flex-col sm:items-start'>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isCurrent ? 'bg-primary text-white ring-4 ring-emerald-100' : isReached ? 'bg-emerald-50 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                  >
                    <Icon name={step.icon} className='text-xl' />
                  </span>
                  <span
                    className={`text-sm font-semibold ${isReached ? 'text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    {t(`customer.bookingDetail.timeline.steps.${step.key}`)}
                  </span>
                </li>
              )
            })}
          </ol>
        </>
      )}
      <div className='mt-6 flex items-start gap-3 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
        <Icon
          name={booking.status === 'cancelled' ? 'event_busy' : 'medical_information'}
          className='text-xl text-primary'
        />
        <p>{t(`customer.bookingDetail.timeline.note.${booking.status}`)}</p>
      </div>
    </section>
  )
}
