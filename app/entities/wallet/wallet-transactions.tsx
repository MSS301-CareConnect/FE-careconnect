import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { WalletTransactionRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { fetchMyWalletTransactions, walletErrorKey, walletKeys } from './wallet-api'
import { transactionSign } from './wallet-labels'
import type { WalletRange } from './wallet-period'

/** One ledger row: type, signed amount, balance before → after (and the held balance when a withdrawal moved it). */
export function WalletTransactionRow({
  transaction,
  bookingHref
}: {
  transaction: WalletTransactionRecord
  bookingHref?: (bookingId: string) => string
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const sign = transactionSign(transaction.type)
  const heldMoved = transaction.heldBefore !== transaction.heldAfter

  return (
    <li className='grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4'>
      <div className='min-w-0'>
        <p className='font-semibold text-on-surface'>{t(`wallet.types.${transaction.type}`)}</p>
        <p className='text-xs text-on-surface-variant'>
          <time dateTime={transaction.createdAt}>{dateTime(transaction.createdAt)}</time>
          {transaction.bookingId && bookingHref ? (
            <>
              {' · '}
              <Link className='font-medium text-primary hover:underline' to={bookingHref(transaction.bookingId)}>
                {t('wallet.transactions.viewBooking')}
              </Link>
            </>
          ) : null}
        </p>
        {heldMoved ? (
          <p className='text-xs text-on-surface-variant'>
            {t('wallet.transactions.held', { amount: money(transaction.heldAfter) })}
          </p>
        ) : null}
      </div>
      <div className='text-left sm:text-right'>
        <p className={`font-bold tabular-nums ${sign > 0 ? 'text-success' : 'text-on-surface'}`}>
          {sign > 0 ? '+' : '−'}
          {money(transaction.amount)}
        </p>
        <p className='text-xs text-on-surface-variant tabular-nums'>
          {t('wallet.transactions.balanceChange', {
            before: money(transaction.availableBefore),
            after: money(transaction.availableAfter)
          })}
        </p>
      </div>
    </li>
  )
}

/** The caller's ledger in the chosen period, newest first, paged by PaymentService. */
export function WalletTransactions({
  range,
  bookingHref
}: {
  range: WalletRange
  bookingHref?: (bookingId: string) => string
}) {
  const { t } = useTranslation()
  // Page resets when the period changes because the key below includes the range.
  const [pageState, setPageState] = useState({ rangeKey: range.from, page: 0 })
  const page = pageState.rangeKey === range.from ? pageState.page : 0
  const transactions = useQuery({
    queryKey: walletKeys.transactions(range.from, range.to, page),
    queryFn: () => fetchMyWalletTransactions(range.from, range.to, page),
    retry: false
  })

  return (
    <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6'>
      <h2 className='text-base font-bold text-on-surface'>{t('wallet.transactions.title')}</h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t('wallet.transactions.hint')}</p>
      {transactions.isPending ? (
        <div className='mt-4 space-y-3' role='status' aria-label={t('wallet.loading')}>
          <Skeleton className='h-12 w-full rounded-xl' />
          <Skeleton className='h-12 w-full rounded-xl' />
        </div>
      ) : null}
      {transactions.isError ? (
        <ErrorState
          className='mt-4'
          message={t(walletErrorKey(transactions.error))}
          onRetry={() => void transactions.refetch()}
        />
      ) : null}
      {transactions.data && transactions.data.items.length === 0 ? (
        <EmptyState className='mt-4' icon='receipt_long' title={t('wallet.transactions.empty')} />
      ) : null}
      {transactions.data && transactions.data.items.length > 0 ? (
        <>
          <ul className='mt-2 divide-y divide-outline-variant/60'>
            {transactions.data.items.map((transaction) => (
              <WalletTransactionRow bookingHref={bookingHref} key={transaction.id} transaction={transaction} />
            ))}
          </ul>
          <Pagination
            className='mt-4'
            onPageChange={(next) => setPageState({ rangeKey: range.from, page: next })}
            page={page}
            totalPages={transactions.data.totalPages}
          />
        </>
      ) : null}
    </section>
  )
}
