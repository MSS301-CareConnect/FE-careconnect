import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { WalletStatisticsRecord, WalletTransactionType } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors, periodLabel } from '~/shared/ui/charts/chart-colors'
import { ColumnChart } from '~/shared/ui/charts/column-chart'
import { DonutChart } from '~/shared/ui/charts/donut-chart'
import { KpiTile } from '~/shared/ui/charts/kpi-tile'
import { staggerVariants } from '~/shared/ui/motion'

type MetricKey =
  | 'totalIncome'
  | 'totalWithdrawn'
  | 'bookingCount'
  | 'totalPaid'
  | 'refundedToWallet'
  | 'refundedToGateway'
  | 'netSpent'
  | 'forfeitIncome'
  | 'serviceIncome'
  | 'commissionDeducted'
  | 'complaintDebits'
  | 'commissionIncome'
  | 'grossCollected'
  | 'totalRefunded'

// What each owner reads first; the backend sends only the numbers of the caller's wallet type.
const METRICS: Record<WalletStatisticsRecord['ownerType'], MetricKey[]> = {
  CUSTOMER: ['totalPaid', 'refundedToWallet', 'refundedToGateway', 'netSpent', 'totalWithdrawn'],
  CAREGIVER: ['forfeitIncome', 'bookingCount', 'totalWithdrawn'],
  // 2026-11-11: center and platform pages are revenue only (money reaches their own accounts, nothing to withdraw).
  CENTER: ['totalIncome', 'serviceIncome', 'commissionDeducted', 'forfeitIncome', 'complaintDebits', 'bookingCount'],
  PLATFORM: ['commissionIncome', 'grossCollected', 'totalRefunded', 'refundedToWallet', 'bookingCount']
}
const ICONS: Partial<Record<MetricKey, string>> = {
  totalIncome: 'trending_up',
  totalWithdrawn: 'outbox',
  serviceIncome: 'medical_services',
  commissionDeducted: 'percent',
  forfeitIncome: 'savings',
  complaintDebits: 'report',
  commissionIncome: 'percent',
  grossCollected: 'payments',
  totalRefunded: 'undo',
  refundedToWallet: 'account_balance_wallet',
  totalPaid: 'payments',
  netSpent: 'shopping_bag',
  bookingCount: 'calendar_month'
}
// Movement types in a fixed order so a type keeps its colour from one period to the next.
const TYPE_ORDER: WalletTransactionType[] = [
  'SERVICE_SETTLEMENT',
  'COMMISSION_CREDIT',
  'REFUND_CREDIT',
  'FORFEIT_CREDIT',
  'COMPLAINT_DEBIT'
]
const TYPE_COLORS = [chartColors.c1, chartColors.c3, chartColors.c4, chartColors.c5, chartColors.c2]

/** Period numbers of a wallet, its chart, the movement mix and — for the platform — what it holds for others. */
export function WalletStatistics({ statistics }: { statistics: WalletStatisticsRecord }) {
  const { t, i18n } = useTranslation()
  const { money } = useFormat()
  const count = new Intl.NumberFormat(i18n.language)
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 })
  const platform = statistics.ownerType === 'PLATFORM'
  const customer = statistics.ownerType === 'CUSTOMER'
  const showMix = statistics.ownerType === 'CENTER' || platform
  const series = [
    {
      key: 'income',
      label: t(customer ? 'wallet.chart.refunded' : platform ? 'wallet.chart.commission' : 'wallet.chart.income'),
      color: chartColors.c1
    },
    ...(customer ? [{ key: 'spent', label: t('wallet.chart.spent'), color: chartColors.c3 }] : []),
    ...(showMix ? [] : [{ key: 'withdrawn', label: t('wallet.chart.withdrawn'), color: chartColors.c2 }])
  ] as { key: 'income' | 'spent' | 'withdrawn'; label: string; color: string }[]
  const points = statistics.series.map((point) => ({
    key: point.period,
    label: periodLabel(point.period),
    values: { income: point.income ?? 0, spent: point.spent ?? 0, withdrawn: point.withdrawn ?? 0 }
  }))
  const slices = TYPE_ORDER.map((type, index) => ({
    key: type,
    label: t(`wallet.types.${type}`),
    value: statistics.byType.find((row) => row.type === type)?.totalAmount ?? 0,
    color: TYPE_COLORS[index]
  }))

  return (
    <div className='space-y-5'>
      <motion.dl
        className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
        initial='hidden'
        variants={staggerVariants(0.06)}
        viewport={{ once: true, amount: 0.2 }}
        whileInView='shown'
      >
        {METRICS[statistics.ownerType].map((metric, index) => (
          <KpiTile
            format={(value) => (metric === 'bookingCount' ? count.format(Math.round(value)) : money(value))}
            icon={ICONS[metric]}
            key={metric}
            label={t(`wallet.metrics.${metric}`)}
            tone={index === 0 ? 'mint' : 'light'}
            value={metric === 'bookingCount' ? statistics.bookingCount : (statistics[metric] ?? 0)}
          />
        ))}
        {platform ? (
          <KpiTile
            format={(value) => money(value)}
            hint={t('wallet.metrics.pendingWithdrawalsValue', {
              count: statistics.pendingWithdrawalCount ?? 0,
              amount: money(statistics.pendingWithdrawalAmount ?? 0)
            })}
            icon='hourglass_top'
            label={t('wallet.metrics.pendingWithdrawals')}
            tone='peach'
            value={statistics.pendingWithdrawalAmount ?? 0}
          />
        ) : null}
      </motion.dl>
      <div className={showMix ? 'grid gap-4 xl:grid-cols-3' : ''}>
        <ChartCard
          className={showMix ? 'xl:col-span-2' : ''}
          title={t(showMix ? 'wallet.chart.revenueTitle' : 'wallet.chart.title')}
        >
          <ColumnChart
            emptyLabel={t('wallet.chart.empty')}
            format={(value) => compact.format(value)}
            points={points}
            series={series}
          />
        </ChartCard>
        {showMix ? (
          <ChartCard description={t('wallet.breakdown.hint')} title={t('wallet.breakdown.title')}>
            <DonutChart format={(value) => money(value)} slices={slices.filter((slice) => slice.value > 0)} />
          </ChartCard>
        ) : null}
      </div>
      {platform && statistics.liabilities ? (
        <section className='rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'>
          <h3 className='text-base font-bold text-forest-950'>{t('wallet.liabilities.title')}</h3>
          <p className='mt-1 text-sm text-on-surface-variant'>{t('wallet.liabilities.hint')}</p>
          <table className='mt-4 w-full text-left text-sm'>
            <thead className='bg-mint-50 text-xs text-on-surface-variant'>
              <tr>
                <th className='px-3 py-2 font-semibold' scope='col'>
                  {t('wallet.liabilities.owner')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.wallets')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.available')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.held')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/60'>
              {statistics.liabilities.map((row) => (
                <tr key={row.ownerType}>
                  <th className='px-3 py-2.5 font-medium text-on-surface' scope='row'>
                    {t(`wallet.liabilities.owners.${row.ownerType}`)}
                  </th>
                  <td className='px-3 py-2.5 text-right tabular-nums'>{count.format(row.walletCount)}</td>
                  <td className='px-3 py-2.5 text-right tabular-nums'>{money(row.availableBalance)}</td>
                  <td className='px-3 py-2.5 text-right tabular-nums'>{money(row.heldBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  )
}
