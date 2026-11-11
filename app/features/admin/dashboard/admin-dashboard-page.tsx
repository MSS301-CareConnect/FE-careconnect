import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
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
import { fetchSystemStatisticsBetween, statisticsKeys } from '~/entities/statistics/statistics-api'
import { useInsightPeriod } from '~/entities/statistics/statistics-period'
import { TopCaregiversCard } from '~/entities/statistics/top-caregivers-card'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { bentoContainer } from '~/shared/ui/bento-page-header'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { AttentionPanel } from './components/attention-panel'
import { PartnersSection } from './components/partners-section'
import { PlatformFinanceSection } from './components/platform-finance-section'
import { TopCentersCard } from './components/top-centers-card'

const key = 'admin.dashboardPage' as const

function DashboardSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-[22px] font-bold tracking-tight text-forest-950'>{title}</h2>
        <p className='text-sm text-on-surface-variant'>{hint}</p>
      </div>
      {children}
    </section>
  )
}

/**
 * Platform overview (2026-11-10): one period (`?period=`) for every live number — platform money first
 * (PaymentService), then the admin's waiting queues, care operations (BookingService `/statistics/system` with its
 * per-center breakdown) and users / partners (Identity, ProviderService). No banner: the title shares a row with the
 * period filter (2026-11-11). No sample data (A-15).
 */
export function AdminDashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  const insight = useInsightPeriod()
  const { range } = insight
  const statistics = useQuery({
    queryKey: statisticsKeys.systemRange(range.fromDate, range.toDate),
    queryFn: () => fetchSystemStatisticsBetween(range.fromDate, range.toDate),
    retry: false
  })

  return (
    <div className={`${bentoContainer} space-y-8`}>
      <header className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-2 sm:pt-4'>
        <h1 className='text-[26px] leading-tight text-forest-950 sm:text-[30px]'>{t(`${key}.title`)}</h1>
        <InsightPeriodSwitch className='flex-1' state={insight} />
      </header>

      <DashboardSection hint={t(`${key}.finance.hint`)} title={t(`${key}.finance.title`)}>
        <PlatformFinanceSection range={range} />
      </DashboardSection>

      {statistics.isPending ? (
        <div aria-label={t('statistics.loading')} className='space-y-4' role='status'>
          <Skeleton className='h-36 rounded-3xl' />
          <Skeleton className='h-32 rounded-3xl' />
          <Skeleton className='h-72 rounded-3xl' />
        </div>
      ) : null}
      {statistics.isError ? (
        <ErrorState message={t('statistics.error')} onRetry={() => void statistics.refetch()} />
      ) : null}

      {statistics.data ? <AttentionPanel data={statistics.data} range={range} /> : null}

      {statistics.data ? (
        <DashboardSection hint={t(`${key}.operations.hint`)} title={t(`${key}.operations.title`)}>
          <OperationalKpis data={statistics.data} />
          <div className='grid gap-4 xl:grid-cols-3'>
            <BookingTrendCard className='xl:col-span-2' data={statistics.data} />
            <VisitOutcomeCard data={statistics.data} />
          </div>
          <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            <TopCentersCard data={statistics.data} />
            <TopCaregiversCard data={statistics.data} />
            <BookingPipelineCard className='lg:col-span-2 xl:col-span-1' data={statistics.data} />
          </div>
          <div className='grid gap-4 lg:grid-cols-3'>
            <BookingTypeCard data={statistics.data} />
            <RatingDistributionCard data={statistics.data} />
            <ComplaintsCard data={statistics.data} />
          </div>
        </DashboardSection>
      ) : null}

      <DashboardSection hint={t(`${key}.partners.hint`)} title={t(`${key}.partners.title`)}>
        <PartnersSection />
      </DashboardSection>
    </div>
  )
}
