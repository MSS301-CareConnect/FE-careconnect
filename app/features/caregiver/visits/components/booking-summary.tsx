import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgForestCard, cgGlassAction, cgPeachAction } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'

/**
 * Forest hero of the booking page (2026-11-10): who and where, the services, the period and four numbers, with the two
 * booking-wide actions — accept every visit still waiting (peach) and withdraw from the remaining days (glass).
 */
export function BookingSummary({
  visits,
  ahead,
  toAccept,
  withdrawable,
  onAcceptAll,
  onWithdrawAll
}: {
  visits: CaregiverOccurrenceRecord[]
  ahead: number
  toAccept: number
  withdrawable: number
  onAcceptAll: () => void
  onWithdrawAll: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const first = visits[0]
  const last = visits[visits.length - 1]
  const people = visitPeople(first)
  const services = [...new Set(visits.flatMap((visit) => visit.services ?? []).map((item) => item.serviceName))].filter(
    Boolean
  )
  const done = visits.filter((visit) => visit.status === 'COMPLETED').length
  const stats = [
    { key: 'total', value: visits.length },
    { key: 'upcoming', value: ahead },
    { key: 'toAccept', value: toAccept },
    { key: 'done', value: done }
  ] as const

  return (
    <section aria-label={t('caregiver.booking.page.summaryLabel')} className={`${cgForestCard} mb-5 p-5 sm:p-6`}>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end'>
        <div className='min-w-0 space-y-2.5'>
          <p className='flex items-center gap-2 text-sm text-white/75 tabular-nums'>
            <Icon className='text-lg text-mint-300' name='date_range' />
            {t('caregiver.booking.page.period', {
              from: format.shortDay(calendarDayOf(first.startAt)),
              to: format.shortDay(calendarDayOf(last.startAt))
            })}
          </p>
          {people.address ? (
            <p className='flex items-start gap-2 text-sm text-white/75'>
              <Icon className='mt-0.5 shrink-0 text-lg text-mint-300' name='location_on' />
              <span>{people.address}</span>
            </p>
          ) : null}
          {services.length ? (
            <ul aria-label={t('caregiver.booking.page.services')} className='flex flex-wrap gap-1.5 pt-1'>
              {services.map((service) => (
                <li
                  className='rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15'
                  key={service}
                >
                  {service}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <dl className='grid grid-cols-4 gap-2 sm:min-w-[420px]'>
          {stats.map((stat) => (
            <div
              className={`rounded-2xl px-3 py-2.5 ${stat.key === 'toAccept' && stat.value > 0 ? 'bg-peach-300 text-forest-950' : 'bg-white/[0.08] ring-1 ring-white/10'}`}
              key={stat.key}
            >
              <dt className='text-[11px] font-medium opacity-75'>{t(`caregiver.booking.page.stats.${stat.key}`)}</dt>
              <dd className='mt-0.5 text-2xl font-bold tabular-nums'>
                <CountUp format={(value) => String(Math.round(value))} value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {toAccept > 0 || withdrawable > 0 ? (
        <div className='mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center'>
          {toAccept > 0 ? (
            <button className={cgPeachAction} onClick={onAcceptAll} type='button'>
              <Icon className='text-lg' name='done_all' />
              {t('caregiver.booking.page.acceptAll', { count: toAccept })}
            </button>
          ) : null}
          {withdrawable > 0 ? (
            <button className={cgGlassAction} onClick={onWithdrawAll} type='button'>
              <Icon className='text-lg' name='event_busy' />
              {t('caregiver.booking.page.withdrawAll')}
            </button>
          ) : null}
          <p className='text-xs text-white/60 sm:ml-auto sm:max-w-xs sm:text-right'>
            {t('caregiver.booking.page.withdrawAllHint')}
          </p>
        </div>
      ) : null}
    </section>
  )
}
