import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { WalletWithdrawalScope } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { BarList } from '~/shared/ui/charts/bar-list'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors, periodLabel } from '~/shared/ui/charts/chart-colors'
import { ColumnChart } from '~/shared/ui/charts/column-chart'
import { DonutChart } from '~/shared/ui/charts/donut-chart'
import { KpiTile } from '~/shared/ui/charts/kpi-tile'
import { staggerVariants } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { fetchWithdrawalStatistics, walletErrorKey, walletKeys } from './wallet-api'
import type { WalletRange } from './wallet-period'

const key = 'wallet.stats' as const

/**
 * Withdrawal dashboard of one scope (2026-11-10): what waits now, what was transferred / rejected in the period, the
 * average handling time, a requested-vs-transferred chart and the split by requester. The center queue (REVIEW of a
 * manager) adds the money the center holds for customers and caregivers.
 */
export function WithdrawalStatistics({ scope, range }: { scope: WalletWithdrawalScope; range: WalletRange }) {
  const { t, i18n } = useTranslation()
  const { money, duration } = useFormat()
  const statistics = useQuery({
    queryKey: walletKeys.withdrawalStatistics(scope, range.from, range.to, range.groupBy),
    queryFn: () => fetchWithdrawalStatistics(scope, range.from, range.to, range.groupBy),
    retry: false
  })
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 })

  if (statistics.isPending) {
    return (
      <div aria-label={t('wallet.loading')} className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' role='status'>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton className='h-32 rounded-3xl' key={index} />
        ))}
      </div>
    )
  }
  if (statistics.isError) {
    return <ErrorState message={t(walletErrorKey(statistics.error))} onRetry={() => void statistics.refetch()} />
  }
  const data = statistics.data
  const custody = data.custodyTotal !== undefined && data.custodyTotal !== null
  const series = [
    { key: 'requested', label: t(`${key}.requestedSeries`), color: chartColors.c3 },
    { key: 'completed', label: t(`${key}.completedSeries`), color: chartColors.c1 }
  ] as const
  const points = data.series.map((point) => ({
    key: point.period,
    label: periodLabel(point.period),
    values: { requested: point.requested, completed: point.completed }
  }))
  const owners = data.byOwnerType.map((row) => ({
    key: row.ownerType,
    label: t(`wallet.review.requesterKinds.${row.ownerType as 'CUSTOMER'}`),
    value: row.completedAmount + row.pendingAmount,
    display: money(row.completedAmount),
    hint: t(`${key}.ownerRow`, { pending: money(row.pendingAmount), completed: money(row.completedAmount) })
  }))

  return (
    <div className='space-y-4'>
      <motion.div
        className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'
        initial='hidden'
        variants={staggerVariants(0.06)}
        viewport={{ once: true, amount: 0.2 }}
        whileInView='shown'
      >
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.pendingHint`, { count: data.pendingCount })}
          icon='hourglass_top'
          label={t(`${key}.pending`)}
          tone={data.pendingCount > 0 ? 'peach' : 'light'}
          value={data.pendingAmount}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.completedHint`, { count: data.completedCount })}
          icon='task_alt'
          label={t(`${key}.completed`)}
          tone='dark'
          value={data.completedAmount}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.requestedHint`, { count: data.requestedCount })}
          icon='outbox'
          label={t(`${key}.requested`)}
          value={data.requestedAmount}
        />
        <KpiTile
          format={(value) =>
            data.avgProcessingMinutes === undefined || data.avgProcessingMinutes === null
              ? t(`${key}.processingNone`)
              : duration(Math.max(1, Math.round(value)))
          }
          hint={t(`${key}.rejectedHint`, { count: data.rejectedCount })}
          icon='timer'
          label={t(`${key}.processing`)}
          value={data.avgProcessingMinutes ?? 0}
        />
      </motion.div>
      <div className='grid gap-4 xl:grid-cols-3'>
        <ChartCard className='xl:col-span-2' description={t(`${key}.chartHint`)} title={t(`${key}.chartTitle`)}>
          <ColumnChart format={(value) => compact.format(value)} points={points} series={series} />
        </ChartCard>
        {custody ? (
          <ChartCard description={t(`${key}.custodyHint`)} title={t(`${key}.custodyTitle`)}>
            <DonutChart
              centerLabel={t(`${key}.custodyTotal`)}
              centerValue={compact.format(data.custodyTotal ?? 0)}
              format={(value) => money(value)}
              slices={[
                {
                  key: 'customer',
                  label: t(`${key}.custodyCustomer`),
                  value: data.custodyCustomerBalance ?? 0,
                  color: chartColors.c3
                },
                {
                  key: 'caregiver',
                  label: t(`${key}.custodyCaregiver`),
                  value: data.custodyCaregiverBalance ?? 0,
                  color: chartColors.c1
                },
                {
                  key: 'held',
                  label: t(`${key}.custodyHeld`),
                  value: data.custodyHeldBalance ?? 0,
                  color: chartColors.c2
                }
              ]}
            />
          </ChartCard>
        ) : (
          <ChartCard description={t(`${key}.ownersHint`)} title={t(`${key}.ownersTitle`)}>
            <BarList color={chartColors.c3} format={(value) => money(value)} items={owners} />
          </ChartCard>
        )}
      </div>
    </div>
  )
}
