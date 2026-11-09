import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '~/shared/ui/form-field'
import { ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { fetchMyWallet, fetchMyWalletStatistics, walletErrorKey, walletKeys } from './wallet-api'
import { useWalletPeriod, WALLET_PERIODS, type WalletPeriod } from './wallet-period'
import { WalletStatistics } from './wallet-statistics'
import { WalletSummary } from './wallet-summary'
import { WalletTransactions } from './wallet-transactions'
import { WalletWithdrawals } from './wallet-withdrawals'
import { WithdrawalDialog } from './withdrawal-dialog'

/**
 * The caller's wallet on one page (every portal): balance and withdraw, the period dashboard, the ledger of the period
 * and — except for the read-only platform wallet — the owner's withdrawal requests. PaymentService decides whose
 * wallet it is from the session.
 */
export function WalletDashboard({ bookingHref }: { bookingHref?: (bookingId: string) => string }) {
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
  const platform = wallet.data.ownerType === 'PLATFORM'

  return (
    <div className='space-y-6'>
      <WalletSummary onWithdraw={platform ? undefined : () => setWithdrawing(true)} wallet={wallet.data} />

      <section aria-labelledby={`${id}-period`} className='space-y-4'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <h2 className='text-[22px] font-bold tracking-tight text-forest-950' id={`${id}-period`}>
            {t(`wallet.titles.${wallet.data.ownerType}`)}
          </h2>
          <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-select`}>
            {t('wallet.period.label')}
            <Select
              className='mt-1 w-auto'
              id={`${id}-select`}
              onChange={(event) => choose(event.target.value as WalletPeriod)}
              value={period}
            >
              {WALLET_PERIODS.map((item) => (
                <option key={item} value={item}>
                  {t(`wallet.period.${item}`)}
                </option>
              ))}
            </Select>
          </label>
        </div>
        {statistics.isPending ? <Skeleton className='h-40 w-full rounded-2xl' /> : null}
        {statistics.isError ? (
          <ErrorState message={t(walletErrorKey(statistics.error))} onRetry={() => void statistics.refetch()} />
        ) : null}
        {statistics.data ? <WalletStatistics statistics={statistics.data} /> : null}
      </section>

      <div className={platform ? '' : 'grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'}>
        <WalletTransactions bookingHref={bookingHref} range={range} />
        {platform ? null : <WalletWithdrawals />}
      </div>

      {platform ? null : (
        <WithdrawalDialog onClose={() => setWithdrawing(false)} open={withdrawing} wallet={wallet.data} />
      )}
    </div>
  )
}
