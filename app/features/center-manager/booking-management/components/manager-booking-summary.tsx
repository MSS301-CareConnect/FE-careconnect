import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingTypeKey, formatDay, shortTime } from '~/entities/booking/booking-format'
import { initialPaymentOf } from '~/entities/payment/payment-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

const k = 'centerManager.bookingDetail' as const
const card = 'rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5'
const heading = 'text-xs font-bold tracking-wide text-on-surface-variant uppercase'

function Line({
  label,
  value,
  hint,
  strong
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  strong?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 ${strong ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}
    >
      <dt>
        {label}
        {hint ? <span className='block text-xs font-normal text-on-surface-variant/80'>{hint}</span> : null}
      </dt>
      <dd className='shrink-0 font-semibold text-on-surface tabular-nums'>{value}</dd>
    </div>
  )
}

/** Payment state in words, the same steps the customer sees: initial payment → paid in full (or refunded). */
function PaymentStatus({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  if (booking.fullyPaidAt)
    return (
      <StatusBadge dot tone='success'>
        {t(`${k}.payment.fullyPaid`)}
      </StatusBadge>
    )
  if (booking.status === 'AWAITING_INITIAL_PAYMENT')
    return (
      <StatusBadge dot tone='warning'>
        {t(`${k}.payment.awaitingInitial`)}
      </StatusBadge>
    )
  if (booking.remainingPaymentDueAt && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS'))
    return (
      <StatusBadge dot tone='info'>
        {t(`${k}.payment.remainingOpen`)}
      </StatusBadge>
    )
  if (
    ['PENDING_CENTER_CONFIRMATION', 'PENDING_CAREGIVER_ASSIGNMENT', 'PENDING_CAREGIVER_CONFIRMATION'].includes(
      booking.status
    )
  )
    return (
      <StatusBadge dot tone='neutral'>
        {t(`${k}.payment.notYet`)}
      </StatusBadge>
    )
  return null
}

/**
 * Side column of the booking: customer, schedule and address, the price of every service (unit price × units, plan),
 * how it is paid (initial payment, remaining balance and its due time, refund), then the milestones.
 */
export function ManagerBookingSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const language = i18n.language
  const deposit = initialPaymentOf(booking)
  const visits = booking.occurrences ?? []
  const counted = visits.filter((visit) => visit.status !== 'CANCELLED' && visit.status !== 'EXPIRED')
  const done = visits.filter((visit) => visit.status === 'COMPLETED').length
  const cancelled = visits.length - counted.length
  const minutes = counted.reduce(
    (sum, visit) => sum + Math.max(0, (new Date(visit.endAt).getTime() - new Date(visit.startAt).getTime()) / 60_000),
    0
  )
  const subtotal = booking.subtotal ?? (booking.services ?? []).reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
  const milestones = [
    ['createdAt', booking.createdAt],
    ['acceptedAt', booking.acceptedAt],
    ['assignmentDueAt', booking.status === 'PENDING_CAREGIVER_ASSIGNMENT' ? booking.assignmentDueAt : undefined],
    ['depositDueAt', booking.status === 'AWAITING_INITIAL_PAYMENT' ? booking.depositDueAt : undefined],
    ['confirmedAt', booking.confirmedAt],
    ['fullyPaidAt', booking.fullyPaidAt],
    ['completedAt', booking.completedAt],
    ['cancelledAt', booking.cancelledAt ?? booking.rejectedAt]
  ] as const

  return (
    <aside className='flex flex-col gap-4 lg:sticky lg:top-24'>
      <section className={card}>
        <h2 className={heading}>{t(`${k}.customer`)}</h2>
        <p className='mt-2 text-base font-bold'>{booking.customer?.fullName ?? '—'}</p>
        {booking.customer?.phoneNumber ? (
          <a
            className='mt-1 flex items-center gap-1.5 text-sm text-primary tabular-nums hover:underline'
            href={`tel:${booking.customer.phoneNumber}`}
          >
            <Icon className='text-base' name='call' />
            {booking.customer.phoneNumber}
          </a>
        ) : null}
        {booking.customer?.email ? (
          <p className='mt-1 flex items-center gap-1.5 text-sm break-all text-on-surface-variant'>
            <Icon className='text-base' name='mail' />
            {booking.customer.email}
          </p>
        ) : null}
      </section>

      <section className={card}>
        <h2 className={heading}>{t(`${k}.schedule`)}</h2>
        <p className='mt-2 font-semibold tabular-nums'>
          {formatDay(booking.startDate, language)}
          {booking.endDate && booking.endDate !== booking.startDate ? ` – ${formatDay(booking.endDate, language)}` : ''}
        </p>
        <p className='text-sm text-on-surface-variant tabular-nums'>
          {t(bookingTypeKey(booking))}
          {booking.startTime ? ` · ${shortTime(booking.startTime)}–${shortTime(booking.endTime)}` : ''}
        </p>
        <dl className='mt-3 grid grid-cols-3 gap-2 text-center'>
          {(
            [
              ['visits', counted.length],
              ['done', done],
              ['cancelledVisits', cancelled]
            ] as const
          ).map(([name, value]) => (
            <div className='rounded-lg bg-surface-container-low px-2 py-2' key={name}>
              <dt className='text-xs text-on-surface-variant'>{t(`${k}.counts.${name}`)}</dt>
              <dd className='text-lg font-bold tabular-nums'>{value}</dd>
            </div>
          ))}
        </dl>
        {minutes > 0 ? (
          <p className='mt-2 text-xs text-on-surface-variant'>
            {t(`${k}.counts.hours`, { hours: format.duration(minutes) })}
          </p>
        ) : null}
        {booking.serviceAddress ? (
          <p className='mt-3 flex items-start gap-1.5 text-sm'>
            <Icon className='mt-0.5 text-base text-primary' name='home_pin' />
            {booking.serviceAddress}
          </p>
        ) : null}
        {booking.customerNote ? (
          <p className='mt-2 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
            {booking.customerNote}
          </p>
        ) : null}
      </section>

      <section className={card}>
        <div className='flex items-center justify-between gap-2'>
          <h2 className={heading}>{t(`${k}.pricing`)}</h2>
          <PaymentStatus booking={booking} />
        </div>
        <ul className='mt-3 flex flex-col gap-3 text-sm'>
          {(booking.services ?? []).map((service) => (
            <li className='flex justify-between gap-3' key={service.id}>
              <span className='min-w-0'>
                <span className='block font-semibold text-on-surface'>{service.serviceName}</span>
                {service.planName ? (
                  <span className='block text-xs text-on-surface-variant'>{service.planName}</span>
                ) : null}
                <span className='block text-xs text-on-surface-variant tabular-nums'>
                  {service.unitType
                    ? t(`${k}.unitLine`, {
                        price: format.money(service.unitPrice),
                        unit: t(`booking.unitType.${service.unitType}`),
                        quantity: service.quantity ?? 1
                      })
                    : format.money(service.unitPrice)}
                </span>
              </span>
              <span className='shrink-0 font-semibold tabular-nums'>{format.money(service.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <dl className='mt-4 flex flex-col gap-2 border-t border-dashed border-outline-variant pt-3 text-sm'>
          {subtotal && subtotal !== booking.totalAmount ? (
            <Line label={t(`${k}.subtotal`)} value={format.money(subtotal)} />
          ) : null}
          {booking.fullyPaidAt ? (
            <Line
              hint={t(`${k}.paidAt`, { time: format.dateTime(booking.fullyPaidAt) })}
              label={t(`${k}.paid`)}
              value={format.money(booking.totalAmount)}
            />
          ) : null}
          {deposit.amount !== undefined && !booking.fullyPaidAt ? (
            <Line
              label={
                deposit.estimated ? t(`${k}.depositEstimated`, { percent: deposit.percent ?? '' }) : t(`${k}.deposit`)
              }
              value={format.money(deposit.amount)}
            />
          ) : null}
          {deposit.remaining && !booking.fullyPaidAt ? (
            <Line
              hint={
                booking.remainingPaymentDueAt && !booking.fullyPaidAt
                  ? t(`${k}.remainingDue`, { time: format.dateTime(booking.remainingPaymentDueAt) })
                  : undefined
              }
              label={t(`${k}.remaining`)}
              value={format.money(deposit.remaining)}
            />
          ) : null}
          {booking.refund?.totalRefund ? (
            <Line
              hint={booking.refund.reason ? t(`payment.refundReason.${booking.refund.reason}`) : undefined}
              label={t(`${k}.refund`)}
              value={`−${format.money(booking.refund.totalRefund)}`}
            />
          ) : null}
          <div className='mt-1 flex items-baseline justify-between gap-3 border-t border-outline-variant/50 pt-3'>
            <dt className='font-bold text-on-surface'>{t(`${k}.total`)}</dt>
            <dd className='text-xl font-extrabold text-primary tabular-nums'>{format.money(booking.totalAmount)}</dd>
          </div>
        </dl>
      </section>

      <section className={card}>
        <h2 className={heading}>{t(`${k}.timeline`)}</h2>
        <dl className='mt-3 flex flex-col gap-1.5 text-sm'>
          {milestones
            .filter(([, value]) => Boolean(value))
            .map(([name, value]) => (
              <div className='flex justify-between gap-3' key={name}>
                <dt className='text-on-surface-variant'>{t(`${k}.milestones.${name}`)}</dt>
                <dd className='tabular-nums'>{format.dateTime(value)}</dd>
              </div>
            ))}
        </dl>
      </section>
    </aside>
  )
}
