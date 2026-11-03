import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { formatClock24 } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import {
  ACTIVE_VISIT_STATUSES,
  VISIT_PAGE_SIZE,
  useMyCaregiverProfile,
  useToday,
  useVisitPage,
  useVisitsToAccept
} from '../data/caregiver-queries'
import { addDays, calendarDayOf, useCaregiverFormat, weekStart } from '../ui/caregiver-format'
import { CaregiverEmpty, CaregiverError, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { NeedsAttention } from './components/needs-attention'
import { NextVisitCard } from './components/next-visit-card'
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
  useDocumentTitle(t('caregiver.today.documentTitle'))

  const visits = upcoming.data?.items ?? []
  const todayVisits = visits.filter((visit) => calendarDayOf(visit.startAt) === today)
  const next = visits.find((visit) => ACTIVE_VISIT_STATUSES.has(visit.status) && new Date(visit.endAt).getTime() > now)
  const givenName = profile.data?.fullName.trim().split(/\s+/).at(-1) ?? ''

  return (
    <div className={cgContainer}>
      <header className='mb-5'>
        <p className='text-sm font-medium text-on-surface-variant tabular-nums'>
          {t('caregiver.today.dateLine', { weekday: format.weekdayLong(today), date: format.date(today) })}
        </p>
        <h1 className='mt-0.5 text-[22px] font-bold text-on-surface sm:text-[28px]'>
          {t(`caregiver.today.greeting.${greetingKey(now, format.language)}`, { name: givenName })}
        </h1>
      </header>

      <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex min-w-0 flex-col gap-4'>
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
                  <Link
                    className='cg-press inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    to='/caregiver/work-shifts'
                  >
                    {t('caregiver.today.empty.action')}
                  </Link>
                  <Link
                    className='cg-press inline-flex min-h-11 items-center rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
                    to='/caregiver/visits'
                  >
                    {t('caregiver.today.empty.upcoming')}
                  </Link>
                </div>
              }
              description={t('caregiver.today.empty.hint')}
              icon='wb_sunny'
              title={t('caregiver.today.empty.title')}
            />
          ) : null}
          {upcoming.isSuccess && todayVisits.length > 0 ? (
            <TodayTimeline nextId={next?.id} now={now} visits={todayVisits} />
          ) : null}
        </div>

        <div className='flex flex-col gap-4'>
          <NeedsAttention
            centerId={profile.data?.centerId}
            now={now}
            profileId={profile.data?.id}
            toAccept={toAccept}
          />
          {week.isSuccess ? <WeekStats visits={week.data.items} /> : null}
          {week.isPending ? <Skeleton className='h-32 rounded-xl' /> : null}
        </div>
      </div>
    </div>
  )
}
