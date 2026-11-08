import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { useShiftLabel } from '../../ui/use-shift-label'
import { VisitStatusBadge } from '../../ui/visit-status-badge'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-baseline justify-between gap-3'>
      <dt className='shrink-0 text-on-surface-variant'>{label}</dt>
      <dd className='min-w-0 text-right font-medium text-on-surface'>{children}</dd>
    </div>
  )
}

/** The booking a visit belongs to: who booked, code and type, the work shift, this visit's price and its services. */
export function VisitBooking({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const money = useFormat().money
  const shift = useShiftLabel(visit.bookingType === 'SHIFT' ? visit.caregiverScheduleId : undefined)

  return (
    <section aria-labelledby='visit-booking' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-booking'>
        {t('caregiver.visitDetail.booking.title')}
      </h2>
      <dl className='mt-2 flex flex-col gap-2 text-sm'>
        {visit.customerName ? (
          <Row label={t('caregiver.visitDetail.booking.customer')}>{visit.customerName}</Row>
        ) : null}
        {visit.bookingCode ? (
          <Row label={t('caregiver.visitDetail.booking.code')}>
            <span className='font-mono text-[13px]'>{visit.bookingCode}</span>
          </Row>
        ) : null}
        {visit.bookingType ? (
          <Row label={t('caregiver.visitDetail.booking.type')}>{t(`booking.bookingType.${visit.bookingType}`)}</Row>
        ) : null}
        {shift.label ? <Row label={t('caregiver.visitDetail.booking.shift')}>{shift.label}</Row> : null}
        {visit.priceAmount !== undefined ? (
          <Row label={t('caregiver.visitDetail.booking.price')}>
            <span className='tabular-nums'>{money(visit.priceAmount)}</span>
          </Row>
        ) : null}
      </dl>
      {visit.services?.length ? (
        <>
          <h3 className='mt-4 text-xs font-semibold text-on-surface-variant'>
            {t('caregiver.visitDetail.booking.services')}
          </h3>
          <ul className='mt-1.5 flex flex-col gap-1.5'>
            {visit.services.map((service, index) => (
              <li className='rounded-lg bg-brand-50 px-3 py-2 text-sm' key={service.careServiceId ?? index}>
                <span className='block font-semibold text-primary'>{service.serviceName}</span>
                {service.planName ? (
                  <span className='block text-xs text-on-surface-variant'>
                    {t('caregiver.visitDetail.booking.plan', { name: service.planName })}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}

/** The caregiver's other visits in the same booking, each opening its own page; the open one is marked. */
export function BookingVisits({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const visits = visit.bookingVisits ?? []
  if (visits.length < 2) return null

  return (
    <section aria-labelledby='booking-visits' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='text-sm font-semibold text-on-surface-variant' id='booking-visits'>
        {t('caregiver.visitDetail.booking.visitsTitle', { count: visits.length })}
      </h2>
      <ul className='mt-2 flex flex-col gap-1.5'>
        {visits.map((item) => {
          const current = item.id === visit.id
          const body = (
            <>
              <span className='grid h-8 min-w-8 place-items-center rounded-md bg-surface-container-lowest px-1.5 text-xs font-bold text-primary tabular-nums'>
                {item.occurrenceNo}
              </span>
              <span className='min-w-0 flex-1 tabular-nums'>
                <span className='block font-semibold text-on-surface'>
                  {format.shortDay(calendarDayOf(item.startAt))} · {format.clockRange(item.startAt, item.endAt)}
                </span>
                {current ? (
                  <span className='block text-xs text-primary'>{t('caregiver.visitDetail.booking.current')}</span>
                ) : null}
              </span>
              <VisitStatusBadge status={item.status} />
              {current ? null : <Icon className='text-lg text-on-surface-variant' name='chevron_right' />}
            </>
          )
          const row = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm'
          return (
            <li key={item.id}>
              {current ? (
                <div aria-current='page' className={`${row} bg-brand-50 ring-1 ring-brand-200`}>
                  {body}
                </div>
              ) : (
                <Link
                  aria-label={t('caregiver.visitDetail.booking.visitNo', { no: item.occurrenceNo })}
                  className={`${row} cg-press bg-surface-container-low hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary`}
                  to={`/caregiver/visits/${item.id}`}
                >
                  {body}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
