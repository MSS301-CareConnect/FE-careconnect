import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Tabs, tabPanelId } from '~/shared/ui/tabs'

import { useToday, useVisitsToAccept } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { VisitListSkeleton } from '../ui/visit-skeleton'
import { VisitDayGroups } from './components/visit-day-groups'
import { VisitRangeFilter } from './components/visit-range-filter'
import { VISIT_TABS, useVisitList, type VisitTab } from './hooks/use-visit-list'

const EMPTY_ICON: Record<VisitTab, string> = {
  upcoming: 'event_available',
  toAccept: 'task_alt',
  done: 'history',
  cancelled: 'event_busy'
}

export function CaregiverVisitsPage() {
  const { t } = useTranslation()
  const today = useToday()
  const now = useNow()
  const list = useVisitList(today)
  const toAccept = useVisitsToAccept(today).data?.totalElements ?? 0
  const { pages } = list
  useDocumentTitle(t('caregiver.visits.documentTitle'))

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('caregiver.visits.subtitle')} title={t('caregiver.visits.title')} />

      <Tabs
        className='mb-4'
        idBase='caregiver-visits'
        items={VISIT_TABS.map((value) => ({
          value,
          label: t(`caregiver.visits.tabs.${value}`),
          badge: value === 'toAccept' ? toAccept : undefined,
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

        {pages.isPending ? <VisitListSkeleton /> : null}
        {pages.isError ? (
          <CaregiverError
            message={t(bookingErrorKey(pages.error))}
            onRetry={() => void pages.refetch()}
            retryLabel={t('caregiver.ui.actions.retry')}
          />
        ) : null}
        {pages.isSuccess && list.visits.length === 0 && !pages.hasNextPage ? (
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
                : list.tab === 'toAccept'
                  ? t('caregiver.visits.empty.toAcceptHint')
                  : undefined
            }
            icon={EMPTY_ICON[list.tab]}
            title={t(`caregiver.visits.empty.${list.tab}`)}
          />
        ) : null}
        {pages.isSuccess && list.groups.length > 0 ? (
          <VisitDayGroups groups={list.groups} now={now} today={today} />
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
