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

/** Caregiver, services with unit price and quantity, and the payment breakdown. */
export function BookingDetailSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const deposit = initialPaymentOf(booking)

  return (
    <aside
      aria-label={t(`${key}.label`)}
      className='flex flex-col gap-4'
    >
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
              {booking.services.map((service) => (
                <li className='flex justify-between gap-3' key={service.id}>
                  <span className='min-w-0'>
                    <span className='block font-medium text-on-surface'>{service.serviceName}</span>
                    <span className='block text-xs text-on-surface-variant tabular-nums'>
                      {service.unitType
                        ? t(`${key}.unitLine`, {
                            price: format.money(service.unitPrice),
                            unit: t(`booking.unitType.${service.unitType}`),
                            quantity: service.quantity ?? 1
                          })
                        : format.money(service.unitPrice)}
                    </span>
                  </span>
                  <span className='shrink-0 font-semibold tabular-nums text-on-surface'>
                    {format.money(service.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className='p-5'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
            {t(`${key}.payment`)}
          </h3>
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
