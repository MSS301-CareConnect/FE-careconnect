import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { WalletStatisticsRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { revealVariants, staggerVariants } from '~/shared/ui/motion'

import { WalletChart } from './wallet-chart'

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
  CENTER: ['totalIncome', 'serviceIncome', 'commissionDeducted', 'forfeitIncome', 'complaintDebits', 'totalWithdrawn'],
  PLATFORM: ['commissionIncome', 'grossCollected', 'totalRefunded', 'refundedToWallet']
}

/** Period numbers of a wallet, its chart and — for the platform — what it holds for others and pending withdrawals. */
export function WalletStatistics({ statistics }: { statistics: WalletStatisticsRecord }) {
  const { t, i18n } = useTranslation()
  const { money } = useFormat()
  const count = new Intl.NumberFormat(i18n.language)
  const valueOf = (metric: MetricKey) =>
    metric === 'bookingCount' ? count.format(statistics.bookingCount) : money(statistics[metric] ?? 0)
  const platform = statistics.ownerType === 'PLATFORM'

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
          <motion.div
            className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${index === 0 ? 'border-transparent bg-mint-100' : 'border-forest-900/[0.06] bg-surface-container-lowest'}`}
            key={metric}
            variants={revealVariants}
          >
            <dt className='text-xs font-semibold text-on-surface-variant'>{t(`wallet.metrics.${metric}`)}</dt>
            <dd className='mt-2 text-[26px] leading-tight font-extrabold tracking-tight text-forest-950 tabular-nums'>
              {valueOf(metric)}
            </dd>
          </motion.div>
        ))}
        {platform ? (
          <div className='rounded-2xl border border-peach-200 bg-peach-50 p-5 shadow-[var(--shadow-card)]'>
            <dt className='text-xs font-semibold text-peach-700'>{t('wallet.metrics.pendingWithdrawals')}</dt>
            <dd className='mt-2 text-lg font-bold tabular-nums text-forest-950'>
              {t('wallet.metrics.pendingWithdrawalsValue', {
                count: statistics.pendingWithdrawalCount ?? 0,
                amount: money(statistics.pendingWithdrawalAmount ?? 0)
              })}
            </dd>
          </div>
        ) : null}
      </motion.dl>
      <div className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
        <WalletChart series={statistics.series} showSpent={statistics.ownerType === 'CUSTOMER'} />
      </div>
      {platform && statistics.liabilities ? (
        <section className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
          <h3 className='text-base font-bold text-on-surface'>{t('wallet.liabilities.title')}</h3>
          <p className='mt-1 text-sm text-on-surface-variant'>{t('wallet.liabilities.hint')}</p>
          <table className='mt-4 w-full text-left text-sm'>
            <thead className='bg-mint-50 text-xs text-on-surface-variant'>
              <tr>
                <th className='py-2 font-semibold' scope='col'>
                  {t('wallet.liabilities.owner')}
                </th>
                <th className='py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.wallets')}
                </th>
                <th className='py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.available')}
                </th>
                <th className='py-2 text-right font-semibold' scope='col'>
                  {t('wallet.liabilities.held')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/60'>
              {statistics.liabilities.map((row) => (
                <tr key={row.ownerType}>
                  <th className='py-2.5 font-medium text-on-surface' scope='row'>
                    {t(`wallet.liabilities.owners.${row.ownerType}`)}
                  </th>
                  <td className='py-2.5 text-right tabular-nums'>{count.format(row.walletCount)}</td>
                  <td className='py-2.5 text-right tabular-nums'>{money(row.availableBalance)}</td>
                  <td className='py-2.5 text-right tabular-nums'>{money(row.heldBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  )
}
