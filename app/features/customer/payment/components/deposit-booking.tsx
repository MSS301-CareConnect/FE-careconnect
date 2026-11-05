import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { matchOccurrenceService } from '~/entities/booking/booking-occurrence-list'
import { bookingTypeKey } from '~/entities/booking/booking-format'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

const VISIBLE_VISITS = 4
const key = 'customer.payment.deposit' as const

function minutesOf(startAt: string, endAt: string) {
  return Math.max(0, Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000))
}

/**
 * What the customer is paying for: who is cared for and where, the caregiver, every visit with its service, price and
 * address (a visit can be somewhere else since 2026-11-05), and the price lines of the booked services.
 */
export function DepositBooking({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [all, setAll] = useState(false)
  const visits = [...(booking.occurrences ?? [])].sort((a, b) => a.startAt.localeCompare(b.startAt))
  const shown = all ? visits : visits.slice(0, VISIBLE_VISITS)
  const elsewhere = visits.filter((visit) => visit.serviceAddress).length
  const name = booking.recipientSnapshot?.fullName ?? '—'

  return (
    <div className='flex flex-col gap-5'>
      <SectionCard icon='event_note' title={t(`${key}.careTitle`)}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12 shrink-0 rounded-full text-base' decorative name={name} />
            <div className='min-w-0'>
              <p className='text-xs font-medium text-on-surface-variant'>{t(`${key}.recipient`)}</p>
              <p className='truncate text-base font-bold text-on-surface'>{name}</p>
              <p className='text-sm text-on-surface-variant'>
                {t(`${key}.type`)}: {t(bookingTypeKey(booking))}
              </p>
            </div>
          </div>
          <AssignedCaregiverCard
            caregiverId={booking.caregiverId}
            profileHref={booking.caregiverId ? `/customer/caregivers/${booking.caregiverId}` : undefined}
          />
        </div>

        <div className='mt-5 flex items-start gap-2.5 rounded-xl bg-surface-container-low p-3.5 text-sm'>
          <Icon className='mt-0.5 text-lg text-primary' name='location_on' />
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-on-surface-variant'>{t(`${key}.address`)}</p>
            <p className='text-on-surface'>{booking.serviceAddress ?? '—'}</p>
            {elsewhere ? (
              <p className='mt-1 text-xs font-semibold text-primary'>
                {t(`${key}.otherAddress`, { count: elsewhere })}
              </p>
            ) : null}
          </div>
        </div>

        <h3 className='mt-6 text-sm font-bold text-on-surface'>{t(`${key}.visitsTitle`, { count: visits.length })}</h3>
        <ol className='mt-2 divide-y divide-outline-variant/70 rounded-xl border border-outline-variant/70'>
          {shown.map((visit) => {
            const service = matchOccurrenceService(visit, booking.services)
            return (
              <li className='flex items-start gap-3 px-3.5 py-3 text-sm sm:px-4' key={visit.id}>
                <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-primary tabular-nums'>
                  {visit.occurrenceNo}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='font-semibold text-on-surface tabular-nums'>
                    {format.shortDayLabel(calendarDayOf(visit.startAt))} · {format.clock(visit.startAt)}–
                    {format.clock(visit.endAt)}
                    <span className='font-normal text-on-surface-variant'>
                      {' '}
                      · {format.duration(visit.durationMinutes ?? minutesOf(visit.startAt, visit.endAt))}
                    </span>
                  </p>
                  <p className='truncate text-on-surface-variant'>{service?.serviceName ?? t(`${key}.allServices`)}</p>
                  {visit.serviceAddress ? (
                    <p className='mt-0.5 flex items-start gap-1 text-xs font-medium text-primary'>
                      <Icon className='text-sm' name='home_pin' />
                      {t(`${key}.visitAt`, { address: visit.serviceAddress })}
                    </p>
                  ) : null}
                </div>
                <span className='shrink-0 font-semibold text-on-surface tabular-nums'>
                  {visit.priceAmount !== undefined ? format.money(visit.priceAmount) : ''}
                </span>
              </li>
            )
          })}
        </ol>
        {visits.length > VISIBLE_VISITS ? (
          <button
            aria-expanded={all}
            className='mt-2 inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setAll((value) => !value)}
            type='button'
          >
            {all ? t(`${key}.showLess`) : t(`${key}.showAll`, { count: visits.length })}
            <Icon className='text-lg' name={all ? 'expand_less' : 'expand_more'} />
          </button>
        ) : null}
      </SectionCard>

      <SectionCard icon='receipt_long' title={t(`${key}.servicesTitle`)}>
        <ul className='divide-y divide-outline-variant/70'>
          {(booking.services ?? []).map((item) => (
            <li className='flex items-start justify-between gap-4 py-3 text-sm first:pt-0' key={item.id}>
              <span className='min-w-0'>
                <span className='block font-semibold text-on-surface'>{item.serviceName}</span>
                <span className='block text-xs text-on-surface-variant'>
                  {[
                    item.planName ? t(`${key}.plan`, { name: item.planName }) : null,
                    item.unitType ? t(`booking.unitType.${item.unitType}`) : null,
                    item.unitPrice !== undefined && item.quantity !== undefined
                      ? t(`${key}.line`, { price: format.money(item.unitPrice), quantity: item.quantity })
                      : null
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className='shrink-0 font-semibold text-on-surface tabular-nums'>
                {item.totalPrice !== undefined ? format.money(item.totalPrice) : ''}
              </span>
            </li>
          ))}
        </ul>
        <p className='mt-2 flex items-baseline justify-between gap-3 border-t border-outline-variant pt-3'>
          <span className='text-sm font-semibold text-on-surface'>{t(`${key}.total`)}</span>
          <span className='text-lg font-bold text-on-surface tabular-nums'>{format.money(booking.totalAmount)}</span>
        </p>
      </SectionCard>
    </div>
  )
}
