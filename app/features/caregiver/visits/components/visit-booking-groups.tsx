import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'
import type { VisitBookingGroup } from '../hooks/use-visit-list'

/**
 * The visits of a tab gathered per booking (2026-11-09): one card per booking with who and where, how many visits, the
 * next one, the date range and what needs attention. The card opens the booking page with every visit of it.
 */
export function VisitBookingGroups({
  groups,
  today,
  tab
}: {
  groups: VisitBookingGroup[]
  today: string
  tab: string
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()

  function when(visit: CaregiverOccurrenceRecord) {
    const day = calendarDayOf(visit.startAt)
    return `${format.relativeDay(day, today)} · ${format.clockRange(visit.startAt, visit.endAt)}`
  }

  return (
    <ul className='cg-stagger flex flex-col gap-3'>
      {groups.map((group) => {
        const first = group.visits[0]
        const last = group.visits[group.visits.length - 1]
        const people = visitPeople(first)
        const name = people.name ?? t('caregiver.visits.patientFallback')
        const toAnswer = group.visits.filter((visit) => visit.status === 'SCHEDULED').length
        const replacing = group.visits.filter((visit) => visit.needsReassignment).length
        const services = [...new Set(group.visits.flatMap((visit) => visit.services ?? []).map((item) => item.serviceName))]
          .filter(Boolean)
          .join(' · ')
        return (
          <li key={group.bookingId}>
            <article
              className={`${cgCard} cg-press relative flex flex-col gap-3 p-4 hover:border-brand-200 hover:shadow-[var(--cg-shadow-2)] sm:p-5`}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h3 className='text-base font-semibold text-on-surface'>
                    <Link
                      aria-label={t('caregiver.booking.groups.openLabel', { code: first.bookingCode ?? '', name })}
                      className='after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary'
                      to={`/caregiver/visits/bookings/${group.bookingId}?from=${tab}`}
                    >
                      {name}
                    </Link>
                  </h3>
                  <p className='mt-0.5 font-mono text-xs text-on-surface-variant'>
                    {first.bookingCode}
                    {first.bookingType ? ` · ${t(`booking.bookingType.${first.bookingType}`)}` : ''}
                  </p>
                </div>
                <span className='shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-primary tabular-nums'>
                  {t('caregiver.booking.groups.visits', { count: group.visits.length })}
                </span>
              </div>

              <div className='flex flex-col gap-1 text-sm text-on-surface-variant'>
                <p className='flex items-center gap-1.5 font-semibold text-on-surface tabular-nums'>
                  <Icon className='text-base text-primary' name='schedule' />
                  {t('caregiver.booking.groups.next', { time: when(first) })}
                </p>
                {group.visits.length > 1 ? (
                  <p className='flex items-center gap-1.5 tabular-nums'>
                    <Icon className='text-base text-primary' name='date_range' />
                    {t('caregiver.booking.groups.range', {
                      from: format.shortDay(calendarDayOf(first.startAt)),
                      to: format.shortDay(calendarDayOf(last.startAt))
                    })}
                  </p>
                ) : null}
                {people.address ? (
                  <p className='flex items-start gap-1.5'>
                    <Icon className='mt-0.5 shrink-0 text-base text-primary' name='location_on' />
                    <span className='line-clamp-1'>{people.address}</span>
                  </p>
                ) : null}
                {services ? (
                  <p className='flex items-start gap-1.5'>
                    <Icon className='mt-0.5 shrink-0 text-base text-primary' name='medical_services' />
                    <span className='line-clamp-1'>{services}</span>
                  </p>
                ) : null}
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                {toAnswer ? <StatusBadge tone='warning'>{t('caregiver.booking.groups.toAnswer', { count: toAnswer })}</StatusBadge> : null}
                {replacing ? (
                  <StatusBadge tone='caution'>{t('caregiver.booking.groups.replacing', { count: replacing })}</StatusBadge>
                ) : null}
                <span className='ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                  {t('caregiver.booking.groups.open')}
                  <Icon className='text-lg' name='chevron_right' />
                </span>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
