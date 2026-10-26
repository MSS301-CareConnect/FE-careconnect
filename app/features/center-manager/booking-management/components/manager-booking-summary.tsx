import { useTranslation } from 'react-i18next'

import { formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

/** Customer contact, schedule, services and money of one booking. */
export function ManagerBookingSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const milestones = [
    ['createdAt', booking.createdAt],
    ['acceptedAt', booking.acceptedAt],
    ['depositDueAt', booking.status === 'AWAITING_DEPOSIT' ? booking.depositDueAt : undefined],
    ['confirmedAt', booking.confirmedAt],
    ['completedAt', booking.completedAt]
  ] as const

  return (
    <aside className='flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24'>
      <div>
        <h2 className='text-base font-bold'>{t('centerManager.bookingDetail.customer')}</h2>
        <p className='mt-2 font-semibold'>{booking.customer?.fullName ?? '—'}</p>
        {booking.customer?.phoneNumber ? (
          <a
            className='mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline'
            href={`tel:${booking.customer.phoneNumber}`}
          >
            <Icon className='text-base' name='call' />
            {booking.customer.phoneNumber}
          </a>
        ) : null}
        {booking.customer?.email ? (
          <p className='mt-1 text-sm text-on-surface-variant'>{booking.customer.email}</p>
        ) : null}
      </div>

      <div className='text-sm'>
        <h2 className='text-base font-bold'>{t('centerManager.bookingDetail.schedule')}</h2>
        <p className='mt-2'>
          {formatDay(booking.startDate, language)}
          {booking.endDate && booking.endDate !== booking.startDate ? ` – ${formatDay(booking.endDate, language)}` : ''}
        </p>
        <p className='text-on-surface-variant'>
          {t(`booking.scheduleType.${booking.scheduleType}`)} · {shortTime(booking.startTime)}–
          {shortTime(booking.endTime)}
        </p>
        {booking.serviceAddress ? <p className='mt-2 text-on-surface-variant'>{booking.serviceAddress}</p> : null}
        {booking.customerNote ? (
          <p className='mt-2 rounded-lg bg-surface-container-low p-3 text-on-surface-variant'>{booking.customerNote}</p>
        ) : null}
      </div>

      <div className='text-sm'>
        <h2 className='text-base font-bold'>{t('centerManager.bookingDetail.services')}</h2>
        <ul className='mt-2 flex flex-col gap-1.5'>
          {(booking.services ?? []).map((service) => (
            <li className='flex justify-between gap-3' key={service.id}>
              <span>{service.serviceName}</span>
              <span className='tabular-nums'>{formatMoney(service.totalPrice, language)}</span>
            </li>
          ))}
        </ul>
        <dl className='mt-3 flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-3'>
          <div className='flex justify-between gap-3 text-on-surface-variant'>
            <dt>{t('centerManager.bookingDetail.deposit')}</dt>
            <dd className='tabular-nums'>{formatMoney(booking.depositAmount, language)}</dd>
          </div>
          <div className='flex justify-between gap-3 font-bold'>
            <dt>{t('centerManager.bookingDetail.total')}</dt>
            <dd className='text-primary tabular-nums'>{formatMoney(booking.totalAmount, language)}</dd>
          </div>
        </dl>
      </div>

      <dl className='flex flex-col gap-1.5 text-sm'>
        {milestones
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => (
            <div className='flex justify-between gap-3' key={key}>
              <dt className='text-on-surface-variant'>{t(`centerManager.bookingDetail.milestones.${key}`)}</dt>
              <dd>{formatDateTime(value, language)}</dd>
            </div>
          ))}
      </dl>
    </aside>
  )
}
