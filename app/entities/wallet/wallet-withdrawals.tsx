import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { fetchWithdrawals, walletErrorKey, walletKeys } from './wallet-api'
import { maskAccountNumber, WithdrawalStatusBadge } from './wallet-labels'

/** The owner's own withdrawal requests with their state, the admin's reason or transfer reference. */
export function WalletWithdrawals() {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const [page, setPage] = useState(0)
  const withdrawals = useQuery({
    queryKey: walletKeys.withdrawals({ page }),
    queryFn: () => fetchWithdrawals({ page }),
    retry: false
  })

  return (
    <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6'>
      <h2 className='text-base font-bold text-on-surface'>{t('wallet.withdrawals.title')}</h2>
      {withdrawals.isPending ? (
        <div aria-label={t('wallet.loading')} className='mt-4 space-y-3' role='status'>
          <Skeleton className='h-14 w-full rounded-xl' />
        </div>
      ) : null}
      {withdrawals.isError ? (
        <ErrorState
          className='mt-4'
          message={t(walletErrorKey(withdrawals.error))}
          onRetry={() => void withdrawals.refetch()}
        />
      ) : null}
      {withdrawals.data && withdrawals.data.items.length === 0 ? (
        <EmptyState className='mt-4' icon='account_balance' title={t('wallet.withdrawals.empty')} />
      ) : null}
      {withdrawals.data && withdrawals.data.items.length > 0 ? (
        <>
          <ul className='mt-2 divide-y divide-outline-variant/60'>
            {withdrawals.data.items.map((withdrawal) => (
              <li className='flex flex-wrap items-start justify-between gap-3 py-3' key={withdrawal.id}>
                <div className='min-w-0'>
                  <p className='font-bold tabular-nums text-on-surface'>{money(withdrawal.amount)}</p>
                  <p className='text-xs text-on-surface-variant'>
                    {withdrawal.bankName} · {maskAccountNumber(withdrawal.bankAccountNumber)} ·{' '}
                    {withdrawal.accountHolderName}
                  </p>
                  <p className='text-xs text-on-surface-variant'>
                    <time dateTime={withdrawal.createdAt}>{dateTime(withdrawal.createdAt)}</time>
                  </p>
                  {withdrawal.rejectReason ? (
                    <p className='mt-1 text-xs text-error'>
                      {t('wallet.withdrawals.rejectReason', { reason: withdrawal.rejectReason })}
                    </p>
                  ) : null}
                  {withdrawal.transferReference ? (
                    <p className='mt-1 text-xs text-on-surface-variant'>
                      {t('wallet.withdrawals.transferReference', { reference: withdrawal.transferReference })}
                    </p>
                  ) : null}
                </div>
                <WithdrawalStatusBadge status={withdrawal.status} />
              </li>
            ))}
          </ul>
          <Pagination className='mt-4' onPageChange={setPage} page={page} totalPages={withdrawals.data.totalPages} />
        </>
      ) : null}
    </section>
  )
}
