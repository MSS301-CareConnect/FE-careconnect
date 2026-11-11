import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchRevenue, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import type { InsightRange } from '~/entities/statistics/statistics-period'
import { fetchMyWalletStatistics, walletErrorKey, walletKeys } from '~/entities/wallet/wallet-api'
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

const key = 'centerManager.statisticsPage.revenue' as const

/**
 * Spec §9.3: the center's revenue (PaymentService `/payments/revenue`, the token decides the center) beside what reached
 * the center wallet in the same period (`/wallets/me/statistics`: served visits after commission, kept deposits,
 * complaint debits) and its chart.
 */
export function CenterFinanceSection({ range }: { range: InsightRange }) {
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
  const count = new Intl.NumberFormat(i18n.language)
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 })
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 })

  if (revenue.isPending) {
    return (
      <div aria-label={t(`${key}.loading`)} className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' role='status'>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton className='h-32 rounded-3xl' key={index} />
        ))}
      </div>
    )
  }
  if (revenue.isError) {
    return <ErrorState message={t(paymentErrorKey(revenue.error))} onRetry={() => void revenue.refetch()} />
  }
  const data = revenue.data
  const statistics = wallet.data
  const breakdown = statistics
    ? [
        { key: 'serviceIncome', value: statistics.serviceIncome ?? 0 },
        { key: 'forfeitIncome', value: statistics.forfeitIncome ?? 0 },
        { key: 'commissionDeducted', value: statistics.commissionDeducted ?? 0 },
        { key: 'complaintDebits', value: statistics.complaintDebits ?? 0 }
      ].map((item) => ({ ...item, label: t(`${key}.breakdown.${item.key as 'serviceIncome'}`) }))
    : []
  const series = [
    { key: 'income', label: t(`${key}.income`), color: chartColors.c1 },
    { key: 'withdrawn', label: t(`${key}.withdrawn`), color: chartColors.c2 }
  ] as const
  const points = (statistics?.series ?? []).map((point) => ({
    key: point.period,
    label: periodLabel(point.period),
    values: { income: point.income ?? 0, withdrawn: point.withdrawn ?? 0 }
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
          hint={t(`${key}.hints.net`, { amount: money(data.averagePayment) })}
          icon='payments'
          label={t(`${key}.metrics.net`)}
          tone='dark'
          value={data.totalRevenue}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.hints.gross`, { count: data.successfulPaymentCount })}
          icon='account_balance'
          label={t(`${key}.metrics.gross`)}
          value={data.grossRevenue}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={t(`${key}.hints.refunded`, {
            percent: percent.format(data.grossRevenue ? data.totalRefunded / data.grossRevenue : 0)
          })}
          icon='undo'
          label={t(`${key}.metrics.refunded`)}
          value={data.totalRefunded}
        />
        <KpiTile
          format={(value) => money(value)}
          hint={statistics ? t(`${key}.hints.wallet`, { amount: money(statistics.availableBalance) }) : undefined}
          icon='account_balance_wallet'
          label={t(`${key}.walletIncome`)}
          tone='mint'
          value={statistics?.totalIncome ?? 0}
        />
      </motion.div>

      {wallet.isError ? (
        <ErrorState message={t(walletErrorKey(wallet.error))} onRetry={() => void wallet.refetch()} />
      ) : (
        <div className='grid gap-4 xl:grid-cols-3'>
          <ChartCard
            action={
              <Link
                className='inline-flex min-h-9 items-center gap-1 rounded-full bg-mint-50 px-3 text-xs font-semibold text-forest-800 hover:bg-mint-100'
                to='/center-manager/wallet'
              >
                {t(`${key}.viewWallet`)}
                <Icon className='text-base' name='arrow_forward' />
              </Link>
            }
            className='xl:col-span-2'
            description={t(`${key}.chartHint`)}
            title={t(`${key}.chartTitle`)}
          >
            {wallet.isPending ? (
              <Skeleton className='h-56 rounded-2xl' />
            ) : (
              <ColumnChart format={(value) => compact.format(value)} points={points} series={series} />
            )}
          </ChartCard>
          <ChartCard description={t(`${key}.breakdownHint`)} title={t(`${key}.breakdownTitle`)}>
            {wallet.isPending ? (
              <Skeleton className='h-48 rounded-2xl' />
            ) : (
              <BarList color={chartColors.c1} format={(value) => money(value)} items={breakdown} />
            )}
            <p className='mt-4 text-xs text-on-surface-variant'>
              {t(`${key}.metrics.payments`)}: {count.format(data.successfulPaymentCount)} ·{' '}
              {t(`${key}.metrics.centerForfeit`)}: {money(data.centerForfeitAmount ?? 0)}
            </p>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
