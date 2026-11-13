import { useTranslation } from 'react-i18next'

import { initialPaymentOf } from '~/entities/payment/payment-api'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.bookingDetail.summary' as const

// A booking that ended before anyone was assigned has no caregiver to promise.
const WAITS_FOR_ASSIGNMENT: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

/** Caregiver, services (plan, unit price, length of a visit, quantity, subtotal) and the payment breakdown. */
export function BookingDetailSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const deposit = initialPaymentOf(booking)

  return (
    <aside aria-label={t(`${key}.label`)} className='flex flex-col gap-4'>
      {/* Caregiver card */}
      {booking.caregiverId || WAITS_FOR_ASSIGNMENT.has(booking.status) ? (
        <div className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
          <AssignedCaregiverCard
            caregiverId={booking.caregiverId}
            profileHref={booking.caregiverId ? `/customer/caregivers/${booking.caregiverId}` : undefined}
          />
        </div>
      ) : null}

      {/* Services & Payment Breakdown card */}
      <div className='rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)] overflow-hidden'>
        {booking.services?.length ? (
          <div className='border-b border-outline-variant/60 p-5'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
              {t(`${key}.services`)}
            </h3>
            <ul className='mt-3 flex flex-col gap-2.5 text-sm'>
              {booking.services.map((service) => {
                // One visit = units per visit × the plan's unit length (an hourly plan without a length is 60 min).
                const unitMinutes = service.planDurationMinutes ?? (service.unitType === 'HOUR' ? 60 : undefined)
                const visitMinutes = unitMinutes ? unitMinutes * (service.unitsPerOccurrence ?? 1) : undefined
                return (
                  <li className='rounded-xl bg-surface-container-low p-3' key={service.id}>
                    <p className='font-semibold text-on-surface'>{service.serviceName}</p>
                    {service.planName ? <p className='text-xs text-on-surface-variant'>{service.planName}</p> : null}
                    <dl className='mt-2 flex flex-col gap-1 tabular-nums'>
                      <div className='flex justify-between gap-3'>
                        <dt className='text-on-surface-variant'>{t(`${key}.unitPrice`)}</dt>
                        <dd className='text-right font-medium text-on-surface'>
                          {format.money(service.unitPrice)}
                          {service.unitType ? ` · ${t(`booking.unitType.${service.unitType}`)}` : ''}
                        </dd>
                      </div>
                      {visitMinutes ? (
                        <div className='flex justify-between gap-3'>
                          <dt className='text-on-surface-variant'>{t(`${key}.visitDuration`)}</dt>
                          <dd className='text-right font-medium text-on-surface'>{format.duration(visitMinutes)}</dd>
                        </div>
                      ) : null}
                      {service.quantity !== undefined && service.unitType ? (
                        <div className='flex justify-between gap-3'>
                          <dt className='text-on-surface-variant'>{t(`${key}.quantity`)}</dt>
                          <dd className='text-right font-medium text-on-surface'>
                            {t(`${key}.units.${service.unitType}`, { count: service.quantity })}
                          </dd>
                        </div>
                      ) : null}
                      <div className='mt-1 flex justify-between gap-3 border-t border-dashed border-outline-variant pt-1.5'>
                        <dt className='font-semibold text-on-surface'>{t(`${key}.subtotal`)}</dt>
                        <dd className='font-bold text-primary'>{format.money(service.totalPrice)}</dd>
                      </div>
                    </dl>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className='p-5'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>{t(`${key}.payment`)}</h3>
          <dl className='mt-3 flex flex-col gap-2 text-sm'>
            {deposit.amount !== undefined ? (
              <div className='flex justify-between gap-3 text-on-surface-variant'>
                <dt>
                  {deposit.estimated
                    ? t(`${key}.depositEstimated`, { percent: deposit.percent ?? '' })
                    : t(`${key}.deposit`)}
                </dt>
                <dd className='font-medium tabular-nums'>{format.money(deposit.amount)}</dd>
              </div>
            ) : null}
            {booking.remainingPaymentDueAt && deposit.remaining ? (
              <div className='flex justify-between gap-3 text-on-surface-variant'>
                <dt>
                  {t(`${key}.remaining`)}
                  <span className='block text-xs text-on-surface-variant/80'>
                    {t(`${key}.remainingDue`, { time: format.dateTime(booking.remainingPaymentDueAt) })}
                  </span>
                </dt>
                <dd className='font-medium tabular-nums'>{format.money(deposit.remaining)}</dd>
              </div>
            ) : null}
            <div className='mt-1 flex items-baseline justify-between gap-3 border-t border-dashed border-outline-variant pt-3'>
              <dt className='font-bold text-on-surface'>{t(`${key}.total`)}</dt>
              <dd className='text-xl font-extrabold text-primary tabular-nums'>{format.money(booking.totalAmount)}</dd>
            </div>
            {booking.fullyPaidAt ? (
              <p className='mt-2 inline-flex items-center gap-1.5 self-start rounded-full bg-success-container px-3 py-1 text-xs font-semibold text-on-success-container'>
                <Icon className='text-base' name='verified' />
                {t(`${key}.fullyPaid`)}
              </p>
            ) : null}
          </dl>
        </div>
      </div>
    </aside>
  )
}
