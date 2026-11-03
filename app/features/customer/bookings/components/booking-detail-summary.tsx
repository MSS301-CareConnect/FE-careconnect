import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingTypeKey, shortTime, weekdayKey } from '~/entities/booking/booking-format'
import { initialPaymentOf } from '~/entities/payment/payment-api'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.bookingDetail.summary' as const

// A booking that ended before anyone was assigned has no caregiver to promise.
const WAITS_FOR_ASSIGNMENT: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-t border-outline-variant/70 px-5 py-4 first:border-t-0'>
      <h2 className='text-sm font-semibold text-on-surface'>{title}</h2>
      <div className='mt-2'>{children}</div>
    </section>
  )
}

/** Caregiver, schedule and address, services with unit price and quantity, and the payment summary. */
export function BookingDetailSummary({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const deposit = initialPaymentOf(booking)
  const weekdays = (booking.daysOfWeek ?? [])
    .flatMap((day) => {
      const weekday = weekdayKey(day)
      return weekday ? [t(`booking.weekdays.${weekday}`)] : []
    })
    .join(', ')
  const hours = booking.startTime ? `${shortTime(booking.startTime)}–${shortTime(booking.endTime)}` : ''

  return (
    <aside
      aria-label={t(`${key}.label`)}
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)]'
    >
      {booking.caregiverId || WAITS_FOR_ASSIGNMENT.has(booking.status) ? (
        <div className='px-5 py-4'>
          <AssignedCaregiverCard
            caregiverId={booking.caregiverId}
            profileHref={booking.caregiverId ? `/customer/caregivers/${booking.caregiverId}` : undefined}
          />
        </div>
      ) : null}

      <Block title={t(`${key}.schedule`)}>
        <ul className='flex flex-col gap-2 text-sm'>
          <li className='flex items-start gap-2.5'>
            <Icon className='mt-0.5 text-lg text-primary' name='calendar_month' />
            <span className='min-w-0'>
              <span className='block font-medium text-on-surface tabular-nums'>
                {format.date(booking.startDate)}
                {booking.endDate && booking.endDate !== booking.startDate ? ` – ${format.date(booking.endDate)}` : ''}
              </span>
              <span className='block text-on-surface-variant'>
                {[t(bookingTypeKey(booking)), hours, weekdays].filter(Boolean).join(' · ')}
              </span>
            </span>
          </li>
          {booking.serviceAddress ? (
            <li className='flex items-start gap-2.5 text-on-surface'>
              <Icon className='mt-0.5 text-lg text-primary' name='home_pin' />
              <span className='min-w-0'>{booking.serviceAddress}</span>
            </li>
          ) : null}
          {booking.customerNote ? (
            <li className='flex items-start gap-2.5 text-on-surface-variant'>
              <Icon className='mt-0.5 text-lg text-primary' name='sticky_note_2' />
              <span className='min-w-0 whitespace-pre-line'>{booking.customerNote}</span>
            </li>
          ) : null}
        </ul>
      </Block>

      {booking.services?.length ? (
        <Block title={t(`${key}.services`)}>
          <ul className='flex flex-col gap-2.5 text-sm'>
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
                <span className='shrink-0 font-medium tabular-nums'>{format.money(service.totalPrice)}</span>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      <Block title={t(`${key}.payment`)}>
        <dl className='flex flex-col gap-2 text-sm'>
          {deposit.amount !== undefined ? (
            <div className='flex justify-between gap-3 text-on-surface-variant'>
              <dt>
                {deposit.estimated
                  ? t(`${key}.depositEstimated`, { percent: deposit.percent ?? '' })
                  : t(`${key}.deposit`)}
              </dt>
              <dd className='tabular-nums'>{format.money(deposit.amount)}</dd>
            </div>
          ) : null}
          {booking.remainingPaymentDueAt && deposit.remaining ? (
            <div className='flex justify-between gap-3 text-on-surface-variant'>
              <dt>
                {t(`${key}.remaining`)}
                <span className='block text-xs'>
                  {t(`${key}.remainingDue`, { time: format.dateTime(booking.remainingPaymentDueAt) })}
                </span>
              </dt>
              <dd className='tabular-nums'>{format.money(deposit.remaining)}</dd>
            </div>
          ) : null}
          <div className='mt-1 flex items-baseline justify-between gap-3 border-t border-dashed border-outline-variant pt-3'>
            <dt className='font-semibold text-on-surface'>{t(`${key}.total`)}</dt>
            <dd className='text-xl font-bold text-on-surface tabular-nums'>{format.money(booking.totalAmount)}</dd>
          </div>
          {booking.fullyPaidAt ? (
            <p className='mt-1 inline-flex items-center gap-1.5 self-start rounded-full bg-success-container px-2.5 py-1 text-xs font-semibold text-on-success-container'>
              <Icon className='text-base' name='verified' />
              {t(`${key}.fullyPaid`)}
            </p>
          ) : null}
        </dl>
      </Block>
    </aside>
  )
}
