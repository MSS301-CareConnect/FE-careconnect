import { useTranslation } from 'react-i18next'

import { formatDay, formatMoney, shortTime, weekdayKey } from '~/entities/booking/booking-format'
import { useDepositAmount } from '~/entities/payment/payment-api'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

// A booking that ended before anyone was assigned has no caregiver to promise.
const WAITS_FOR_ASSIGNMENT = new Set(['PENDING', 'AWAITING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS'])

/** Schedule, caregiver, services and price of one booking as BookingService stored them. */
export function BookingDetailSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const deposit = useDepositAmount(booking)
  const weekdays = (booking.daysOfWeek ?? [])
    .flatMap((day) => {
      const key = weekdayKey(day)
      return key ? [t(`booking.weekdays.${key}`)] : []
    })
    .join(', ')

  return (
    <aside className='flex flex-col gap-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6 lg:sticky lg:top-24'>
      {booking.caregiverId || WAITS_FOR_ASSIGNMENT.has(booking.status) ? (
        <AssignedCaregiverCard
          caregiverId={booking.caregiverId}
          profileHref={booking.caregiverId ? `/customer/caregivers/${booking.caregiverId}` : undefined}
        />
      ) : null}
      <div>
        <h2 className='text-base font-bold text-on-surface'>{t('customer.bookingDetail.summary.schedule')}</h2>
        <p className='mt-2 flex items-start gap-2 text-sm text-on-surface'>
          <Icon className='text-lg text-primary' name='calendar_month' />
          <span>
            {formatDay(booking.startDate, language)}
            {booking.endDate && booking.endDate !== booking.startDate
              ? ` – ${formatDay(booking.endDate, language)}`
              : ''}
            <span className='block text-on-surface-variant'>
              {t(`booking.scheduleType.${booking.scheduleType}`)} · {shortTime(booking.startTime)}–
              {shortTime(booking.endTime)}
              {weekdays ? ` · ${weekdays}` : ''}
            </span>
          </span>
        </p>
        {booking.serviceAddress ? (
          <p className='mt-2 flex items-start gap-2 text-sm text-on-surface-variant'>
            <Icon className='text-lg text-primary' name='home_pin' />
            {booking.serviceAddress}
          </p>
        ) : null}
        {booking.customerNote ? (
          <p className='mt-2 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
            {booking.customerNote}
          </p>
        ) : null}
      </div>

      <div>
        <h2 className='text-base font-bold text-on-surface'>{t('customer.bookingDetail.summary.services')}</h2>
        <ul className='mt-2 flex flex-col gap-2 text-sm'>
          {(booking.services ?? []).map((service) => (
            <li className='flex justify-between gap-3' key={service.id}>
              <span className='min-w-0'>
                <span className='block font-semibold text-on-surface'>{service.serviceName}</span>
                <span className='block text-xs text-on-surface-variant'>
                  {formatMoney(service.unitPrice, language)}
                  {service.unitType ? ` ${t(`booking.unitType.${service.unitType}`)}` : ''}
                </span>
              </span>
              <span className='shrink-0 tabular-nums'>{formatMoney(service.totalPrice, language)}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className='flex flex-col gap-2 rounded-lg bg-surface-container-low p-4 text-sm'>
        {deposit.amount !== undefined ? (
          <div className='flex justify-between gap-3 text-on-surface-variant'>
            <dt>
              {deposit.estimated
                ? t('customer.bookingDetail.summary.depositEstimated')
                : t('customer.bookingDetail.summary.deposit')}
            </dt>
            <dd className='tabular-nums'>{formatMoney(deposit.amount, language)}</dd>
          </div>
        ) : null}
        <div className='flex items-baseline justify-between gap-3'>
          <dt className='font-semibold text-on-surface'>{t('customer.bookingDetail.summary.total')}</dt>
          <dd className='text-xl font-bold text-primary tabular-nums'>{formatMoney(booking.totalAmount, language)}</dd>
        </div>
      </dl>
    </aside>
  )
}
