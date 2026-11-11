import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SegmentedControl } from '~/shared/ui/segmented-control'
import { ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { CenterCustodyCard } from './center-custody-card'
import { fetchMyWallet, fetchMyWalletStatistics, walletErrorKey, walletKeys } from './wallet-api'
import { useWalletPeriod, WALLET_PERIODS } from './wallet-period'
import { WalletStatistics } from './wallet-statistics'
import { WalletSummary } from './wallet-summary'
import { WalletTransactions } from './wallet-transactions'
import { WalletWithdrawals } from './wallet-withdrawals'
import { WithdrawalDialog } from './withdrawal-dialog'

/**
 * The caller's wallet on one page: balance and withdraw, the period dashboard, the ledger of the period and the owner's
 * withdrawal requests. PaymentService decides whose wallet it is from the session. Since 2026-11-11 a center or the
 * platform receives its money straight into its own account, so their page is revenue only: no balance, no withdrawal.
 */
export function WalletDashboard({
  bookingHref,
  withdrawalQueueHref
}: {
  bookingHref?: (bookingId: string) => string
  /** Center wallet: link to the queue of customer / caregiver withdrawals the center handles (2026-11-10). */
  withdrawalQueueHref?: string
}) {
  const { t } = useTranslation()
  const id = useId()
  const { period, range, choose } = useWalletPeriod()
  const [withdrawing, setWithdrawing] = useState(false)
  const wallet = useQuery({ queryKey: walletKeys.mine, queryFn: fetchMyWallet, retry: false })
  const statistics = useQuery({
    queryKey: walletKeys.statistics(range.from, range.to, range.groupBy),
    queryFn: () => fetchMyWalletStatistics(range.from, range.to, range.groupBy),
    retry: false
  })

  if (wallet.isPending) {
    return (
      <div aria-label={t('wallet.loading')} className='space-y-4' role='status'>
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-48 w-full rounded-2xl' />
      </div>
    )
  }
  if (wallet.isError) {
    return <ErrorState message={t(walletErrorKey(wallet.error))} onRetry={() => void wallet.refetch()} />
  }
  const revenue = wallet.data.ownerType === 'CENTER' || wallet.data.ownerType === 'PLATFORM'

  return (
    <div className='space-y-6'>
      {revenue ? null : <WalletSummary onWithdraw={() => setWithdrawing(true)} wallet={wallet.data} />}
      {wallet.data.ownerType === 'CENTER' && withdrawalQueueHref ? (
        <CenterCustodyCard queueHref={withdrawalQueueHref} range={range} />
      ) : null}

      <section aria-labelledby={`${id}-period`} className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-[22px] font-bold tracking-tight text-forest-950' id={`${id}-period`}>
            {t(revenue ? 'wallet.period.revenue' : 'wallet.period.overview')}
          </h2>
          <SegmentedControl
            className='w-full sm:w-[22rem]'
            legend={t('wallet.period.label')}
            onChange={choose}
            options={WALLET_PERIODS.map((item) => ({ value: item, label: t(`wallet.period.${item}`) }))}
            value={period}
          />
        </div>
        {statistics.isPending ? <Skeleton className='h-40 w-full rounded-2xl' /> : null}
        {statistics.isError ? (
          <ErrorState message={t(walletErrorKey(statistics.error))} onRetry={() => void statistics.refetch()} />
        ) : null}
        {statistics.data ? <WalletStatistics statistics={statistics.data} /> : null}
      </section>

      <div className={revenue ? '' : 'grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'}>
        <WalletTransactions bookingHref={bookingHref} range={range} />
        {revenue ? null : <WalletWithdrawals />}
      </div>

      {revenue ? null : (
        <WithdrawalDialog onClose={() => setWithdrawing(false)} open={withdrawing} wallet={wallet.data} />
      )}
    </div>
  )
}
