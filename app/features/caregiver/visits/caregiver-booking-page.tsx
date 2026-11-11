import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Pagination } from '~/shared/ui/pagination'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useBookingVisits, useToday } from '../data/caregiver-queries'
import { acceptableVisits } from '../data/use-visit-actions'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { visitPeople } from '../ui/visit-card'
import { AcceptVisitsDialog } from './components/accept-visits-dialog'
import { BookingDaySection, type DayActions } from './components/booking-day-section'
import { BookingMonthView } from './components/booking-month-view'
import { BookingSummary } from './components/booking-summary'
import { WithdrawDialog } from './components/withdraw-dialog'
import { VISIT_TABS } from './hooks/use-visit-list'
import { groupVisitsByDay, remainingWithdrawal, type WithdrawScope } from './withdraw-model'

// Visits that are still ahead (or running); the rest are past or closed.
const AHEAD = new Set(['SCHEDULED', 'ACKNOWLEDGED', 'IN_PROGRESS'])
const DAYS_PER_PAGE = 5
type View = 'days' | 'calendar'
type Scope = 'upcoming' | 'past'

interface WithdrawState {
  visits: CaregiverOccurrenceRecord[]
  kept?: CaregiverOccurrenceRecord[]
  scope: WithdrawScope
}

/**
 * Every visit of one booking assigned to the caregiver (2026-11-10 redesign): a forest summary with the booking-wide
 * actions, then the visits by day (each day names its services, five days a page, upcoming or past) or a month calendar
 * with one chip per day. Days can be accepted at once and withdrawn whole (a day with several visits cannot be
 * withdrawn visit by visit).
 */
export function CaregiverBookingPage({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const now = useNow()
  const today = useToday()
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'calendar' ? 'calendar' : 'days'
  const fromTab = VISIT_TABS.find((tab) => tab === params.get('from'))
  const [scope, setScope] = useState<Scope>('upcoming')
  const [page, setPage] = useState(0)
  const [accepting, setAccepting] = useState<CaregiverOccurrenceRecord[] | null>(null)
  const [withdrawing, setWithdrawing] = useState<WithdrawState | null>(null)
  const query = useBookingVisits(bookingId)
  const visits = query.data ?? []
  const first = visits[0]
  const name = (first ? visitPeople(first).name : undefined) ?? t('caregiver.visits.patientFallback')
  const code = first?.bookingCode ?? ''
  useDocumentTitle(t('caregiver.booking.page.documentTitle', { code }))
  const back = {
    to: fromTab && fromTab !== 'upcoming' ? `/caregiver/visits?tab=${fromTab}` : '/caregiver/visits',
    label: t('caregiver.booking.page.back')
  }

  if (query.isPending)
    return (
      <div className={cgContainer}>
        <SkeletonGroup className='flex flex-col gap-3' label={t('caregiver.booking.page.loading')}>
          <Skeleton className='h-9 w-64 rounded-md' />
          <Skeleton className='h-44 rounded-2xl' />
          <Skeleton className='h-40 rounded-2xl' />
        </SkeletonGroup>
      </div>
    )
  if (query.isError)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.booking.page.error')} />
        <CaregiverError
          message={t(bookingErrorKey(query.error))}
          onRetry={() => void query.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      </div>
    )
  if (!first)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.booking.page.notFound')} />
      </div>
    )

  const ahead = visits.filter((visit) => AHEAD.has(visit.status))
  const past = visits.filter((visit) => !AHEAD.has(visit.status))
  const toAccept = acceptableVisits(visits, now)
  const remaining = remainingWithdrawal(visits, now)
  const days = groupVisitsByDay(scope === 'upcoming' ? ahead : past)
  if (scope === 'past') days.reverse()
  const totalPages = Math.max(1, Math.ceil(days.length / DAYS_PER_PAGE))
  const currentPage = Math.min(page, totalPages - 1)
  const shownDays = days.slice(currentPage * DAYS_PER_PAGE, (currentPage + 1) * DAYS_PER_PAGE)

  const actions: DayActions = {
    onAccept: setAccepting,
    onWithdraw: (plan) => setWithdrawing({ visits: plan.visits, scope: plan.scope })
  }

  function changeView(next: View) {
    setParams(
      (previous) => {
        const merged = new URLSearchParams(previous)
        if (next === 'calendar') merged.set('view', 'calendar')
        else merged.delete('view')
        return merged
      },
      { replace: true }
    )
  }

  return (
    <div className={`${cgContainer} pb-24`}>
      <CaregiverPageHeader
        back={back}
        eyebrow={
          <span>
            <span className='font-mono'>{code}</span>
            {first.bookingType ? ` · ${t(`booking.bookingType.${first.bookingType}`)}` : ''}
          </span>
        }
        title={t('caregiver.booking.page.title', { name })}
      />

      <BookingSummary
        ahead={ahead.length}
        onAcceptAll={() => setAccepting(toAccept)}
        onWithdrawAll={() =>
          setWithdrawing({ visits: remaining.withdrawable, kept: remaining.kept, scope: 'remaining' })
        }
        toAccept={toAccept.length}
        visits={visits}
        withdrawable={remaining.withdrawable.length}
      />

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <SegmentedControl
          legend={t('caregiver.booking.page.views.legend')}
          onChange={changeView}
          options={[
            { value: 'days', label: t('caregiver.booking.page.views.days') },
            { value: 'calendar', label: t('caregiver.booking.page.views.calendar') }
          ]}
          value={view}
        />
        {view === 'days' ? (
          <SegmentedControl
            legend={t('caregiver.booking.page.scope.legend')}
            onChange={(next: Scope) => {
              setScope(next)
              setPage(0)
            }}
            options={[
              { value: 'upcoming', label: t('caregiver.booking.page.scope.upcoming', { count: ahead.length }) },
              { value: 'past', label: t('caregiver.booking.page.scope.past', { count: past.length }) }
            ]}
            value={scope}
          />
        ) : null}
      </div>

      {view === 'calendar' ? (
        <BookingMonthView actions={actions} now={now} today={today} visits={visits} />
      ) : shownDays.length ? (
        <div className='flex flex-col gap-4'>
          <div className='cg-stagger flex flex-col gap-4' key={`${scope}-${currentPage}`}>
            {shownDays.map((group) => (
              <BookingDaySection
                actions={actions}
                day={group.day}
                key={group.day}
                now={now}
                today={today}
                visits={group.visits}
              />
            ))}
          </div>
          <Pagination
            ariaLabel={t('caregiver.booking.day.pagination')}
            onPageChange={(next) => {
              setPage(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            page={currentPage}
            totalPages={totalPages}
          />
        </div>
      ) : (
        <CaregiverEmpty
          icon={scope === 'upcoming' ? 'event_available' : 'history'}
          title={scope === 'upcoming' ? t('caregiver.booking.page.noUpcoming') : t('caregiver.booking.page.noPast')}
        />
      )}

      {accepting ? <AcceptVisitsDialog onClose={() => setAccepting(null)} visits={accepting} /> : null}
      {withdrawing ? (
        <WithdrawDialog
          kept={withdrawing.kept}
          onClose={() => setWithdrawing(null)}
          scope={withdrawing.scope}
          visits={withdrawing.visits}
        />
      ) : null}
    </div>
  )
}
