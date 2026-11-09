import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { StatusBadge } from '~/shared/ui/status-badge'
import { PillTabs } from '~/shared/ui/pill-tabs'
import { tabPanelId } from '~/shared/ui/tabs'

import { useBookingRequests, useToday, useVisitsToAccept } from '../data/caregiver-queries'
import { BookingRequestsList } from '../requests/booking-requests-list'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { VisitListSkeleton } from '../ui/visit-skeleton'
import { VisitBookingGroups } from './components/visit-booking-groups'
import { VisitRangeFilter } from './components/visit-range-filter'
import { VISIT_TABS, useVisitList, type VisitTab } from './hooks/use-visit-list'

const EMPTY_ICON: Record<VisitTab, string> = {
  respond: 'task_alt',
  upcoming: 'event_available',
  inProgress: 'play_circle',
  done: 'history',
  cancelled: 'event_busy'
}

function SourceHeading({
  title,
  hint,
  badge,
  tone
}: {
  title: string
  hint: string
  badge: string
  tone: 'info' | 'active'
}) {
  return (
    <div className='mb-3'>
      <h2 className='flex flex-wrap items-center gap-2 text-base font-semibold text-on-surface'>
        {title}
        <StatusBadge tone={tone}>{badge}</StatusBadge>
      </h2>
      <p className='mt-0.5 text-sm text-on-surface-variant'>{hint}</p>
    </div>
  )
}

/**
 * Care visits with five tabs. "Needs your answer" gathers everything waiting on the caregiver: bookings families sent
 * straight to them (accept / decline) and visits the center assigned (confirm), each with its source.
 */
export function CaregiverVisitsPage() {
  const { t } = useTranslation()
  const today = useToday()
  const list = useVisitList(today)
  const toAccept = useVisitsToAccept(today).data?.totalElements ?? 0
  const requests = useBookingRequests()
  const requestCount = requests.data?.totalElements ?? 0
  const { pages } = list
  useDocumentTitle(t('caregiver.visits.documentTitle'))
  const respond = list.tab === 'respond'
  const nothingToAnswer = respond && requests.isSuccess && requestCount === 0

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('caregiver.visits.subtitle')} title={t('caregiver.visits.title')} />

      <PillTabs
        className='mb-4'
        idBase='caregiver-visits'
        items={VISIT_TABS.map((value) => ({
          value,
          label: t(`caregiver.visits.tabs.${value}`),
          badge: value === 'respond' ? toAccept + requestCount : undefined,
          badgeTone: 'attention' as const
        }))}
        label={t('caregiver.visits.tabsLabel')}
        onChange={list.setTab}
        value={list.tab}
      />

      <div aria-labelledby={`caregiver-visits-tab-${list.tab}`} id={tabPanelId('caregiver-visits')} role='tabpanel'>
        {list.history ? (
          <div className='mb-4'>
            <VisitRangeFilter
              from={list.customFrom}
              invalid={list.customInvalid}
              onCustom={list.setCustom}
              onRange={list.setRange}
              range={list.range}
              to={list.customTo}
            />
          </div>
        ) : null}

        {respond && requestCount > 0 ? (
          <section className='mb-6'>
            <SourceHeading
              badge={t('caregiver.visits.respond.sourceCustomer')}
              hint={t('caregiver.visits.respond.fromCustomerHint')}
              title={t('caregiver.visits.respond.fromCustomer')}
              tone='active'
            />
            <BookingRequestsList hideEmpty />
          </section>
        ) : null}
        {respond && list.visits.length > 0 ? (
          <SourceHeading
            badge={t('caregiver.visits.respond.sourceCenter')}
            hint={t('caregiver.visits.respond.fromCenterHint')}
            title={t('caregiver.visits.respond.fromCenter')}
            tone='info'
          />
        ) : null}

        {pages.isPending ? <VisitListSkeleton /> : null}
        {pages.isError ? (
          <CaregiverError
            message={t(bookingErrorKey(pages.error))}
            onRetry={() => void pages.refetch()}
            retryLabel={t('caregiver.ui.actions.retry')}
          />
        ) : null}
        {pages.isSuccess && list.visits.length === 0 && !pages.hasNextPage && (!respond || nothingToAnswer) ? (
          <CaregiverEmpty
            action={
              list.tab === 'upcoming' ? (
                <Link
                  className='cg-press inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  to='/caregiver/work-shifts'
                >
                  {t('caregiver.visits.openShifts')}
                </Link>
              ) : undefined
            }
            description={
              list.tab === 'upcoming'
                ? t('caregiver.visits.empty.upcomingHint')
                : respond
                  ? t('caregiver.visits.empty.respondHint')
                  : undefined
            }
            icon={EMPTY_ICON[list.tab]}
            title={t(`caregiver.visits.empty.${list.tab}`)}
          />
        ) : null}
        {pages.isSuccess && list.bookingGroups.length > 0 ? (
          <VisitBookingGroups groups={list.bookingGroups} tab={list.tab} today={today} />
        ) : null}
        {pages.hasNextPage ? (
          <div className='mt-5 flex justify-center'>
            <Button loading={pages.isFetchingNextPage} onClick={() => void pages.fetchNextPage()} variant='outline'>
              {t('caregiver.ui.actions.loadMore')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
