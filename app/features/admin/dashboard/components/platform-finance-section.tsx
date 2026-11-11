import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchRevenue, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import type { InsightRange } from '~/entities/statistics/statistics-period'
import { fetchMyWalletStatistics, walletKeys } from '~/entities/wallet/wallet-api'
import { useFormat } from '~/shared/lib/format'
import { BarList } from '~/shared/ui/charts/bar-list'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors, periodLabel } from '~/shared/ui/charts/chart-colors'
import { ColumnChart } from '~/shared/ui/charts/column-chart'
import { KpiTile } from '~/shared/ui/charts/kpi-tile'
import { Icon } from '~/shared/ui/icon'
import { staggerVariants } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

const key = 'admin.dashboardPage' as const

/**
 * Platform money of the period: what customers paid and what was refunded (`/payments/revenue` without a center = the
 * whole platform), the commission series and what the platform holds for others (platform wallet statistics).
 */
export function PlatformFinanceSection({ range }: { range: InsightRange }) {
  const { t, i18n } = useTranslation()
  const { money } = useFormat()
  const revenue = useQuery({
    queryKey: paymentKeys.revenue(range.from, range.to),
    queryFn: () => fetchRevenue(range.from, range.to),
    retry: false
  })
  const wallet = useQuery({
    queryKey: walletKeys.statistics(range.from, range.to, range.groupBy),
    queryFn: () => fetchMyWalletStatistics(range.from, range.to, range.groupBy),
    retry: false
  })
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 })

  if (revenue.isPending || wallet.isPending) {
    return (
      <div aria-label={t('statistics.loading')} className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' role='status'>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton className='h-32 rounded-3xl' key={index} />
        ))}
      </div>
    )
  }
  if (revenue.isError) {
    return <ErrorState message={t(paymentErrorKey(revenue.error))} onRetry={() => void revenue.refetch()} />
  }
  if (wallet.isError) {
    return <ErrorState message={t(paymentErrorKey(wallet.error))} onRetry={() => void wallet.refetch()} />
  }
  const data = revenue.data
  const platform = wallet.data
  const held = (platform.liabilities ?? [])
    .filter((row) => row.ownerType !== 'PLATFORM')
    .reduce((sum, row) => sum + row.availableBalance + row.heldBalance, 0)
  const points = platform.series.map((point) => ({
    key: point.period,
    label: periodLabel(point.period),
    values: { commission: point.income ?? 0 }
  }))
  const breakdown = [
    { key: 'gross', value: data.grossRevenue },
    { key: 'refunded', value: data.totalRefunded },
    { key: 'caregiverForfeit', value: data.caregiverForfeitAmount ?? 0 },
    { key: 'centerNet', value: data.totalRevenue },
    { key: 'commissionShare', value: platform.commissionIncome ?? 0 }
  ].map((item) => ({ ...item, label: t(`${key}.finance.${item.key as 'gross'}`) }))

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
          hint={t(`${key}.kpis.collectedHint`, { count: data.successfulPaymentCount })}
          icon='payments'
          label={t(`${key}.kpis.collected`)}
          tone='dark'
          value={data.grossRevenue}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.kpis.commissionHint`, { amount: money(platform.availableBalance) })}
          icon='percent'
          label={t(`${key}.kpis.commission`)}
          tone='mint'
          value={platform.commissionIncome ?? 0}
        />
        <KpiTile
          format={(value) => money(value)}
          icon='undo'
          label={t(`${key}.finance.refunded`)}
          value={data.totalRefunded}
        />
        <KpiTile
          format={(value) => money(value)}
          icon='volunteer_activism'
          label={t(`${key}.finance.liabilities`)}
          tone='peach'
          value={held}
        />
      </motion.div>
      <div className='grid gap-4 xl:grid-cols-3'>
        <ChartCard
          action={
            <Link
              className='inline-flex min-h-9 items-center gap-1 rounded-full bg-mint-50 px-3 text-xs font-semibold text-forest-800 hover:bg-mint-100'
              to='/admin/wallet'
            >
              {t(`${key}.finance.viewWallet`)}
              <Icon className='text-base' name='arrow_forward' />
            </Link>
          }
          className='xl:col-span-2'
          description={t(`${key}.finance.chartHint`)}
          title={t(`${key}.finance.chartTitle`)}
        >
          <ColumnChart
            format={(value) => compact.format(value)}
            points={points}
            series={[{ key: 'commission', label: t(`${key}.finance.commission`), color: chartColors.c1 }]}
          />
        </ChartCard>
        <ChartCard description={t(`${key}.finance.breakdownHint`)} title={t(`${key}.finance.breakdownTitle`)}>
          <BarList color={chartColors.c3} format={(value) => money(value)} items={breakdown} />
        </ChartCard>
      </div>
    </div>
  )
}
