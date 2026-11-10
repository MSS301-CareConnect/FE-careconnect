import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { formatClock24 } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import {
  ACTIVE_VISIT_STATUSES,
  VISIT_PAGE_SIZE,
  useMyCaregiverProfile,
  useBookingRequests,
  useToday,
  useVisitPage,
  useVisitsToAccept
} from '../data/caregiver-queries'
import { addDays, calendarDayOf, useCaregiverFormat, weekStart } from '../ui/caregiver-format'
import { CaregiverEmpty, CaregiverError, cgContainer, cgForestAction, cgOutlineAction } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { NeedsAttention } from './components/needs-attention'
import { NextVisitCard } from './components/next-visit-card'
import { OpenShiftSuggestions } from './components/open-shift-suggestions'
import { TodayTimeline } from './components/today-timeline'
import { WeekStats } from './components/week-stats'

function greetingKey(now: number, language: string) {
  const hour = Number(formatClock24(new Date(now).toISOString(), language).slice(0, 2))
  return hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
}

/** The caregiver's home: the next visit first, today's other visits, what needs action and this week's numbers. */
export function CaregiverTodayPage() {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const today = useToday()
  const now = useNow()
  const profile = useMyCaregiverProfile()
  const upcoming = useVisitPage({ from: today, page: 0, size: VISIT_PAGE_SIZE })
  const monday = weekStart(today)
  const week = useVisitPage({ from: monday, to: addDays(monday, 6), page: 0, size: VISIT_PAGE_SIZE })
  const toAccept = useVisitsToAccept(today).data?.totalElements ?? 0
  const requests = useBookingRequests().data?.totalElements ?? 0
  useDocumentTitle(t('caregiver.today.documentTitle'))

  const visits = upcoming.data?.items ?? []
  const todayVisits = visits.filter((visit) => calendarDayOf(visit.startAt) === today)
  const next = visits.find((visit) => ACTIVE_VISIT_STATUSES.has(visit.status) && new Date(visit.endAt).getTime() > now)
  const givenName = profile.data?.fullName.trim().split(/\s+/).at(-1) ?? ''

  return (
    <div className={cgContainer}>
      <header className='mb-6'>
        <p className='inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-[13px] font-semibold text-forest-700 tabular-nums ring-1 ring-forest-900/5'>
          <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-400' />
          {t('caregiver.today.dateLine', { weekday: format.weekdayLong(today), date: format.date(today) })}
        </p>
        <h1 className='mt-3 text-[28px] leading-tight text-forest-950 sm:text-[40px]'>
          <Trans
            components={{ accent: <span className='cc-accent-serif text-forest-700' /> }}
            i18nKey={`caregiver.today.greeting.${greetingKey(now, format.language)}`}
            values={{ name: givenName }}
          />
        </h1>
      </header>

      <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='cg-stagger flex min-w-0 flex-col gap-5'>
          {upcoming.isPending ? (
            <SkeletonGroup className='flex flex-col gap-4' label={t('caregiver.ui.states.loading')}>
              <Skeleton className='h-80 rounded-2xl' />
              <Skeleton className='h-40 rounded-xl' />
            </SkeletonGroup>
          ) : null}
          {upcoming.isError ? (
            <CaregiverError
              message={t(bookingErrorKey(upcoming.error))}
              onRetry={() => void upcoming.refetch()}
              retryLabel={t('caregiver.ui.actions.retry')}
            />
          ) : null}
          {upcoming.isSuccess && next ? <NextVisitCard now={now} today={today} visit={next} /> : null}
          {upcoming.isSuccess && todayVisits.length === 0 ? (
            <CaregiverEmpty
              action={
                <div className='flex flex-wrap justify-center gap-2'>
                  <Link className={cgForestAction} to='/caregiver/work-shifts'>
                    {t('caregiver.today.empty.action')}
                  </Link>
                  <Link className={cgOutlineAction} to='/caregiver/visits'>
                    {t('caregiver.today.empty.upcoming')}
                  </Link>
                </div>
              }
              description={t('caregiver.today.empty.hint')}
              icon='wb_sunny'
              title={t('caregiver.today.empty.title')}
            />
          ) : null}
          {upcoming.isSuccess && todayVisits.length === 0 ? (
            <OpenShiftSuggestions centerId={profile.data?.centerId} now={now} />
          ) : null}
          {upcoming.isSuccess && todayVisits.length > 0 ? (
            <TodayTimeline nextId={next?.id} now={now} visits={todayVisits} />
          ) : null}
        </div>

        <div className='cg-stagger flex flex-col gap-5'>
          <NeedsAttention
            centerId={profile.data?.centerId}
            now={now}
            profileId={profile.data?.id}
            requests={requests}
            toAccept={toAccept}
          />
          {week.isSuccess ? <WeekStats today={today} visits={week.data.items} /> : null}
          {week.isPending ? <Skeleton className='h-56 rounded-2xl' /> : null}
        </div>
      </div>
    </div>
  )
}
