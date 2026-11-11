import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { acceptableVisits } from '../../data/use-visit-actions'
import { minutesBetweenInstants, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { dayWithdrawal } from '../withdraw-model'
import { BookingVisitRow } from './booking-visit-row'

export interface DayActions {
  onAccept: (visits: CaregiverOccurrenceRecord[]) => void
  onWithdraw: (plan: ReturnType<typeof dayWithdrawal>) => void
}

/**
 * One day of the booking (2026-11-10): a header with the date, how many visits from when to when, the services done
 * that day and the day's actions (accept the day, withdraw the day — a day with several visits is withdrawn whole),
 * then the visits in order.
 */
export function BookingDaySection({
  day,
  visits,
  today,
  now,
  actions,
  headingLevel = 'h3'
}: {
  day: string
  visits: CaregiverOccurrenceRecord[]
  today: string
  now: number
  actions: DayActions
  headingLevel?: 'h2' | 'h3'
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const Heading = headingLevel
  const first = visits[0]
  const last = visits[visits.length - 1]
  const minutes = visits.reduce((sum, visit) => sum + minutesBetweenInstants(visit.startAt, visit.endAt), 0)
  const services = [...new Set(visits.flatMap((visit) => visit.services ?? []).map((item) => item.serviceName))].filter(
    Boolean
  )
  const toAccept = acceptableVisits(visits, now)
  const withdrawal = dayWithdrawal(visits, now)
  const isToday = day === today
  const relative = format.relativeDay(day, today)

  return (
    <section aria-labelledby={`booking-day-${day}`} className={`${cgCard} overflow-hidden`}>
      <header className='flex flex-col gap-3 border-b border-outline-variant/60 bg-gradient-to-r from-mint-50/80 to-transparent px-4 py-3.5 sm:flex-row sm:items-center'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <span
            aria-hidden='true'
            className={`grid w-12 shrink-0 place-items-center rounded-2xl py-1.5 leading-tight ${isToday ? 'bg-forest-900 text-white shadow-[var(--shadow-soft)]' : 'bg-white text-forest-900 ring-1 ring-forest-900/10'}`}
          >
            <span className='text-[11px] font-semibold opacity-75'>{format.weekday(day)}</span>
            <span className='text-lg font-bold tabular-nums'>{day.slice(8)}</span>
          </span>
          <div className='min-w-0'>
            <Heading className='text-[15px] font-semibold text-on-surface' id={`booking-day-${day}`}>
              {relative === format.shortDay(day)
                ? `${format.weekdayLong(day)}, ${format.date(day)}`
                : `${relative} · ${format.date(day)}`}
            </Heading>
            <p className='text-xs text-on-surface-variant tabular-nums'>
              {t('caregiver.booking.day.summary', {
                count: visits.length,
                span: format.clockRange(first.startAt, last.endAt),
                duration: format.duration(minutes)
              })}
            </p>
            {services.length ? (
              <ul aria-label={t('caregiver.booking.day.services')} className='mt-1.5 flex flex-wrap gap-1'>
                {services.map((service) => (
                  <li
                    className='rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-forest-800 ring-1 ring-forest-900/10'
                    key={service}
                  >
                    {service}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        {toAccept.length || withdrawal.allowed ? (
          <div className='flex shrink-0 flex-wrap gap-2'>
            {toAccept.length > 1 ? (
              <Button
                leftIcon={<Icon className='text-base' name='done_all' />}
                onClick={() => actions.onAccept(toAccept)}
                size='sm'
                variant='dark'
              >
                {t('caregiver.booking.day.acceptDay', { count: toAccept.length })}
              </Button>
            ) : null}
            {withdrawal.allowed ? (
              <Button
                leftIcon={<Icon className='text-base' name='event_busy' />}
                onClick={() => actions.onWithdraw(withdrawal)}
                size='sm'
                variant='outline'
              >
                {withdrawal.scope === 'day'
                  ? t('caregiver.booking.day.withdrawDay')
                  : t('caregiver.booking.day.withdrawOne')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </header>
      <ul className='divide-y divide-outline-variant/50'>
        {visits.map((visit) => (
          <BookingVisitRow key={visit.id} now={now} visit={visit} />
        ))}
      </ul>
    </section>
  )
}
