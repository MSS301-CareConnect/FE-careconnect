import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { fetchWithdrawalStatistics, walletKeys } from './wallet-api'
import type { WalletRange } from './wallet-period'

/**
 * Center wallet (2026-11-10): money the center holds for its customers and caregivers (refunds, kept deposits still in
 * their wallets) and what is waiting to be transferred, with a link to the center withdrawal queue.
 */
export function CenterCustodyCard({ range, queueHref }: { range: WalletRange; queueHref: string }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const statistics = useQuery({
    queryKey: walletKeys.withdrawalStatistics('REVIEW', range.from, range.to, range.groupBy),
    queryFn: () => fetchWithdrawalStatistics('REVIEW', range.from, range.to, range.groupBy),
    retry: false
  })
  if (!statistics.data) return null
  const data = statistics.data

  return (
    <section className='flex flex-col gap-4 rounded-3xl border border-peach-200 bg-peach-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
      <div className='flex gap-4'>
        <span aria-hidden='true' className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80'>
          <Icon className='text-xl text-peach-700' name='volunteer_activism' />
        </span>
        <div>
          <h3 className='text-base font-bold text-forest-950'>{t('wallet.stats.custodyTitle')}</h3>
          <p className='mt-0.5 max-w-2xl text-sm text-on-surface-variant'>{t('wallet.stats.custodyHint')}</p>
          <p className='mt-2 text-2xl font-extrabold tracking-tight text-forest-950 tabular-nums'>
            {money(data.custodyTotal ?? 0)}
          </p>
          <p className='text-xs text-peach-700'>
            {t('wallet.review.pendingCount', { count: data.pendingCount, amount: money(data.pendingAmount) })}
          </p>
        </div>
      </div>
      <Link
        className='inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-forest-900 px-5 text-sm font-semibold text-white hover:bg-forest-800'
        to={queueHref}
      >
        {t('wallet.review.openQueue')}
        <Icon className='text-base' name='arrow_forward' />
      </Link>
    </section>
  )
}
