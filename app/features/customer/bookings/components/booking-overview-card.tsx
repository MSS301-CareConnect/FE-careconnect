import { useTranslation } from 'react-i18next'

import { bookingTypeKey, shortTime, weekdayKey } from '~/entities/booking/booking-format'
import { canChangeServiceAddress } from '~/entities/booking/service-address-dialog'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.bookingDetail.overview' as const

export interface BookingOverviewCardProps {
  booking: BookingDetailRecord
  now: number
  onEditAddress?: () => void
}

export function BookingOverviewCard({ booking, now, onEditAddress }: BookingOverviewCardProps) {
  const { t } = useTranslation()
  const format = useFormat()
  const canEditAddress = canChangeServiceAddress(booking, now) && Boolean(onEditAddress)

  const weekdays = (booking.daysOfWeek ?? [])
    .flatMap((day) => {
      const weekday = weekdayKey(day)
      return weekday ? [t(`booking.weekdays.${weekday}`)] : []
    })
    .join(', ')
  const hours = booking.startTime ? `${shortTime(booking.startTime)}–${shortTime(booking.endTime)}` : ''

  return (
    <section
      aria-labelledby='booking-overview-title'
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'
    >
      <div className='flex items-center justify-between gap-3 border-b border-outline-variant/50 pb-4'>
        <div className='flex items-center gap-2.5'>
          <span className='grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-primary'>
            <Icon className='text-xl' name='assignment_ind' />
          </span>
          <h2 className='text-base font-bold text-on-surface' id='booking-overview-title'>
            {t(`${key}.title`)}
          </h2>
        </div>
      </div>

      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        {/* Patient */}
        <div className='flex items-start gap-3'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-primary'>
            <Icon className='text-lg' name='personal_injury' />
          </span>
          <div className='min-w-0'>
            <span className='block text-xs font-medium text-on-surface-variant'>{t(`${key}.patient`)}</span>
            <span className='font-bold text-on-surface'>{booking.recipientSnapshot?.fullName ?? '—'}</span>
            {booking.recipientSnapshot?.age ? (
              <span className='ml-1 text-xs text-on-surface-variant'>
                {t(`${key}.age`, { count: booking.recipientSnapshot.age })}
              </span>
            ) : null}
            {booking.recipientSnapshot?.careRequirements ? (
              <p className='mt-0.5 text-xs text-on-surface-variant truncate'>
                {booking.recipientSnapshot.careRequirements}
              </p>
            ) : null}
          </div>
        </div>

        {/* Schedule */}
        <div className='flex items-start gap-3'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-primary'>
            <Icon className='text-lg' name='calendar_month' />
          </span>
          <div className='min-w-0'>
            <span className='block text-xs font-medium text-on-surface-variant'>{t(`${key}.time`)}</span>
            <span className='font-medium text-on-surface tabular-nums'>
              {format.date(booking.startDate)}
              {booking.endDate && booking.endDate !== booking.startDate ? ` – ${format.date(booking.endDate)}` : ''}
            </span>
            <span className='block text-xs text-on-surface-variant'>
              {[t(bookingTypeKey(booking)), hours, weekdays].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className='flex items-start gap-3 sm:col-span-2'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-primary'>
            <Icon className='text-lg' name='home_pin' />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <span className='text-xs font-medium text-on-surface-variant'>{t(`${key}.address`)}</span>
              {canEditAddress ? (
                <button
                  className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'
                  onClick={onEditAddress}
                  type='button'
                >
                  <Icon className='text-sm' name='edit' />
                  {t(`${key}.editAddress`)}
                </button>
              ) : null}
            </div>
            <p className='text-sm text-on-surface'>{booking.serviceAddress ?? '—'}</p>
          </div>
        </div>

        {/* Note */}
        {booking.customerNote ? (
          <div className='flex items-start gap-3 sm:col-span-2'>
            <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-primary'>
              <Icon className='text-lg' name='sticky_note_2' />
            </span>
            <div className='min-w-0 flex-1 rounded-xl bg-surface-container-low/70 p-3'>
              <span className='block text-xs font-medium text-on-surface-variant'>{t(`${key}.note`)}</span>
              <p className='mt-0.5 text-sm text-on-surface whitespace-pre-line'>{booking.customerNote}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
