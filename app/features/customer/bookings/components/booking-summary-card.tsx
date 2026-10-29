import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

export function BookingSummaryCard({ booking }: { booking: BookingSummaryRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const range =
    booking.endDate && booking.endDate !== booking.startDate
      ? t('customer.myBookings.card.dateRange', {
          from: formatDay(booking.startDate, language),
          to: formatDay(booking.endDate, language)
        })
      : formatDay(booking.startDate, language)
  const total = booking.totalCount ?? 0
  const done = booking.completedCount ?? 0

  return (
    <article className='group rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs transition-[border-color,box-shadow] hover:border-outline hover:shadow-md sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-lg font-bold text-on-surface'>
              {booking.recipientName ?? t('customer.myBookings.card.patientFallback')}
            </h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className='mt-1 text-sm text-on-surface-variant tabular-nums'>
            {t('customer.myBookings.card.code', { code: booking.bookingCode })}
          </p>
        </div>
        <p className='text-right'>
          <span className='block text-xs text-on-surface-variant'>{t('customer.myBookings.card.total')}</span>
          <strong className='text-lg font-bold text-primary tabular-nums'>
            {formatMoney(booking.totalAmount, language)}
          </strong>
        </p>
      </div>

      <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-3'>
        <div className='flex items-start gap-2'>
          <Icon className='mt-0.5 text-lg text-primary' name='calendar_month' />
          <div>
            <dt className='sr-only'>{t('customer.myBookings.card.schedule')}</dt>
            <dd className='font-semibold text-on-surface'>{range}</dd>
            <dd className='text-on-surface-variant'>
              {t(`booking.scheduleType.${booking.scheduleType}`)} · {shortTime(booking.startTime)}–
              {shortTime(booking.endTime)}
            </dd>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          <Icon className='mt-0.5 text-lg text-primary' name='event_upcoming' />
          <div>
            <dt className='text-on-surface-variant'>{t('customer.myBookings.card.next')}</dt>
            <dd className='font-semibold text-on-surface'>
              {booking.nextOccurrenceAt
                ? formatDateTime(booking.nextOccurrenceAt, language)
                : t('customer.myBookings.card.noNext')}
            </dd>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          <Icon className='mt-0.5 text-lg text-primary' name='task_alt' />
          <div className='min-w-0 flex-1'>
            <dt className='text-on-surface-variant'>{t('customer.myBookings.card.progress')}</dt>
            <dd className='font-semibold text-on-surface'>
              {t('customer.myBookings.card.progressValue', { done, total })}
            </dd>
            {total > 0 ? (
              <dd aria-hidden='true' className='mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container'>
                <span className='block h-full bg-primary' style={{ width: `${Math.round((done / total) * 100)}%` }} />
              </dd>
            ) : null}
          </div>
        </div>
      </dl>

      <div className='mt-4 flex justify-end'>
        <Link
          className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high'
          to={`/customer/bookings/${booking.id}`}
        >
          {t('customer.myBookings.card.view')}
          <Icon className='text-lg transition-transform group-hover:translate-x-0.5' name='arrow_forward' />
        </Link>
      </div>
    </article>
  )
}
