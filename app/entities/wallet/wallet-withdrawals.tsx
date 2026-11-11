import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { WALLET_PAGE_SIZE, fetchWithdrawals, walletErrorKey, walletKeys } from './wallet-api'
import { WalletWithdrawalDetailDialog } from './wallet-detail-dialogs'
import { maskAccountNumber, WithdrawalStatusBadge } from './wallet-labels'

/** The owner's own withdrawal requests with their state, the admin's reason or transfer reference. */
export function WalletWithdrawals() {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(WALLET_PAGE_SIZE)
  const [selected, setSelected] = useState<WalletWithdrawalRecord | null>(null)
  const withdrawals = useQuery({
    queryKey: walletKeys.withdrawals({ page, size }),
    queryFn: () => fetchWithdrawals({ page, size }),
    retry: false
  })

  return (
    <section className='rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'>
      <h2 className='text-lg font-bold tracking-tight text-forest-950'>{t('wallet.withdrawals.title')}</h2>
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
              <li key={withdrawal.id}>
                <button
                  aria-label={t('wallet.detail.openWithdrawal', {
                    amount: money(withdrawal.amount),
                    status: t(`wallet.withdrawals.statuses.${withdrawal.status}`)
                  })}
                  className='-mx-2 flex w-[calc(100%+1rem)] flex-wrap items-start justify-between gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                  onClick={() => setSelected(withdrawal)}
                  type='button'
                >
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
                </button>
              </li>
            ))}
          </ul>
          <Pagination
            className='mt-4'
            onPageChange={setPage}
            onPageSizeChange={(next) => {
              setSize(next)
              setPage(0)
            }}
            page={page}
            pageSize={size}
            totalElements={withdrawals.data.totalElements}
            totalPages={withdrawals.data.totalPages}
          />
        </>
      ) : null}
      {selected ? <WalletWithdrawalDetailDialog onClose={() => setSelected(null)} withdrawal={selected} /> : null}
    </section>
  )
}
