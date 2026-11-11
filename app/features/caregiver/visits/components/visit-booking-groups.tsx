import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { StatusBadge } from '~/shared/ui/status-badge'

import { acceptableVisits } from '../../data/use-visit-actions'
import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'
import { visitPeople } from '../../ui/visit-card'
import type { VisitBookingGroup } from '../hooks/use-visit-list'
import { AcceptVisitsDialog } from './accept-visits-dialog'

const GROUPS_PER_PAGE = 8

/**
 * The visits of a tab gathered per booking (2026-11-09): one card per booking with who and where, how many visits, the
 * next one, the date range and what needs attention (to confirm, being replaced, missed). Eight bookings a page
 * (2026-11-10); a booking with visits waiting offers "accept all" right on its card. The card opens the booking page.
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
  const now = useNow()
  const [page, setPage] = useState(0)
  const [accepting, setAccepting] = useState<CaregiverOccurrenceRecord[] | null>(null)
  const totalPages = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE))
  const currentPage = Math.min(page, totalPages - 1)
  const shown = groups.slice(currentPage * GROUPS_PER_PAGE, (currentPage + 1) * GROUPS_PER_PAGE)

  function when(visit: CaregiverOccurrenceRecord) {
    const day = calendarDayOf(visit.startAt)
    return `${format.relativeDay(day, today)} · ${format.clockRange(visit.startAt, visit.endAt)}`
  }

  return (
    <div className='flex flex-col gap-4'>
      <ul className='cg-stagger grid gap-3 lg:grid-cols-2' key={currentPage}>
        {shown.map((group) => {
          const first = group.visits[0]
          const last = group.visits[group.visits.length - 1]
          const people = visitPeople(first)
          const name = people.name ?? t('caregiver.visits.patientFallback')
          const toAccept = acceptableVisits(group.visits, now)
          const replacing = group.visits.filter((visit) => visit.needsReassignment).length
          const missed = group.visits.filter((visit) => visit.status === 'CAREGIVER_MISSED').length
          const services = [
            ...new Set(group.visits.flatMap((visit) => visit.services ?? []).map((item) => item.serviceName))
          ]
            .filter(Boolean)
            .join(' · ')
          return (
            <li key={group.bookingId}>
              <article className={`${cgCard} cg-lift relative flex h-full flex-col gap-3 p-5 hover:border-mint-200`}>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <h3 className='text-base font-semibold text-on-surface'>
                      <Link
                        aria-label={t('caregiver.booking.groups.openLabel', { code: first.bookingCode ?? '', name })}
                        className='after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary'
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

                <div className='mt-auto flex flex-wrap items-center gap-2'>
                  {toAccept.length ? (
                    <StatusBadge tone='warning'>
                      {t('caregiver.booking.groups.toAnswer', { count: toAccept.length })}
                    </StatusBadge>
                  ) : null}
                  {replacing ? (
                    <StatusBadge tone='caution'>
                      {t('caregiver.booking.groups.replacing', { count: replacing })}
                    </StatusBadge>
                  ) : null}
                  {missed ? (
                    <StatusBadge dot tone='danger'>
                      {t('caregiver.booking.groups.missed', { count: missed })}
                    </StatusBadge>
                  ) : null}
                  <span className='ml-auto flex items-center gap-2'>
                    {toAccept.length > 1 ? (
                      <Button
                        className='relative z-10'
                        leftIcon={<Icon className='text-base' name='done_all' />}
                        onClick={() => setAccepting(toAccept)}
                        size='sm'
                        variant='dark'
                      >
                        {t('caregiver.booking.groups.acceptAll', { count: toAccept.length })}
                      </Button>
                    ) : null}
                    <span className='inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                      {t('caregiver.booking.groups.open')}
                      <Icon className='text-lg' name='chevron_right' />
                    </span>
                  </span>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
      <Pagination
        ariaLabel={t('caregiver.booking.groups.pagination')}
        onPageChange={(next) => {
          setPage(next)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        page={currentPage}
        totalPages={totalPages}
      />
      {accepting ? <AcceptVisitsDialog onClose={() => setAccepting(null)} visits={accepting} /> : null}
    </div>
  )
}
