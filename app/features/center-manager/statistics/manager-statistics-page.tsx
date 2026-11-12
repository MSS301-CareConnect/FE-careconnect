import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  BookingPipelineCard,
  BookingTrendCard,
  BookingTypeCard,
  ComplaintsCard,
  InsightPeriodSwitch,
  RatingDistributionCard,
  VisitOutcomeCard
} from '~/entities/statistics/insight-cards'
import { OperationalKpis } from '~/entities/statistics/operational-kpis'
import { fetchCenterStatisticsBetween, statisticsKeys } from '~/entities/statistics/statistics-api'
import { useInsightPeriod } from '~/entities/statistics/statistics-period'
import { TopCaregiversCard } from '~/entities/statistics/top-caregivers-card'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { bentoContainer } from '~/shared/ui/bento-page-header'
import { DashboardSection } from '~/shared/ui/dashboard-section'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { CenterFinanceSection } from './components/center-finance-section'

const key = 'centerManager.statisticsPage' as const

/**
 * The center dashboard (2026-11-10): one period (`?period=`, or a custom `?from=&to=` range) drives every section —
 * money first (revenue + center wallet), then the six operational numbers with the booking / visit trend and outcomes,
 * then quality (ratings, complaints, top caregivers). No banner: the title shares a row with the period filter so the
 * numbers start at the top (2026-11-11). BookingService scopes the statistics to the manager's center from the token.
 */
export function ManagerStatisticsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  const insight = useInsightPeriod()
  const { range } = insight
  const statistics = useQuery({
    queryKey: statisticsKeys.centerRange(range.fromDate, range.toDate),
    queryFn: () => fetchCenterStatisticsBetween(range.fromDate, range.toDate),
    retry: false
  })

  return (
    <div className={`${bentoContainer} space-y-8`}>
      <header className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-2 sm:pt-4'>
        <h1 className='text-[26px] leading-tight text-forest-950 sm:text-[30px]'>{t(`${key}.title`)}</h1>
        <InsightPeriodSwitch className='flex-1' state={insight} />
      </header>

      <DashboardSection hint={t(`${key}.revenue.hint`)} title={t(`${key}.revenue.title`)}>
        <CenterFinanceSection range={range} />
      </DashboardSection>

      <DashboardSection hint={t(`${key}.operations.hint`)} title={t(`${key}.operations.title`)}>
        {statistics.isPending ? (
          <div aria-label={t('statistics.loading')} className='space-y-4' role='status'>
            <Skeleton className='h-32 rounded-3xl' />
            <Skeleton className='h-72 rounded-3xl' />
          </div>
        ) : null}
        {statistics.isError ? (
          <ErrorState message={t('statistics.error')} onRetry={() => void statistics.refetch()} />
        ) : null}
        {statistics.data ? (
          <>
            <OperationalKpis data={statistics.data} />
            <div className='grid gap-4 xl:grid-cols-3'>
              <BookingTrendCard className='xl:col-span-2' data={statistics.data} />
              <VisitOutcomeCard data={statistics.data} />
            </div>
            <div className='grid gap-4 lg:grid-cols-2'>
              <BookingPipelineCard data={statistics.data} />
              <BookingTypeCard data={statistics.data} />
            </div>
          </>
        ) : null}
      </DashboardSection>

      {statistics.data ? (
        <DashboardSection hint={t(`${key}.quality.hint`)} title={t(`${key}.quality.title`)}>
          <div className='grid gap-4 lg:grid-cols-3'>
            <RatingDistributionCard data={statistics.data} />
            <TopCaregiversCard data={statistics.data} />
            <ComplaintsCard data={statistics.data} />
          </div>
        </DashboardSection>
      ) : null}
    </div>
  )
}
