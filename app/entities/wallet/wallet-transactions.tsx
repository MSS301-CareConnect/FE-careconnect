import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { WalletTransactionRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { Skeleton } from '~/shared/ui/skeleton'

import { WALLET_PAGE_SIZE, fetchMyWalletTransactions, walletErrorKey, walletKeys } from './wallet-api'
import { WalletTransactionDetailDialog } from './wallet-detail-dialogs'
import { transactionSign } from './wallet-labels'
import type { WalletRange } from './wallet-period'

/** One ledger row: type, signed amount, balance before → after (and the held balance when a withdrawal moved it). */
export function WalletTransactionRow({
  transaction,
  bookingHref,
  onOpen
}: {
  transaction: WalletTransactionRecord
  bookingHref?: (bookingId: string) => string
  /** Opens the movement's detail; the whole row becomes a button and the booking link moves into the detail. */
  onOpen?: () => void
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const sign = transactionSign(transaction.type)
  const heldMoved = transaction.heldBefore !== transaction.heldAfter

  const grid =
    'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4'
  const content = (
    <>
      <span
        aria-label={t(sign > 0 ? 'wallet.transactions.moneyIn' : 'wallet.transactions.moneyOut')}
        className={`grid h-10 w-10 place-items-center rounded-full ${sign > 0 ? 'bg-mint-100 text-forest-700' : 'bg-peach-100 text-peach-700'}`}
        role='img'
      >
        <Icon className='text-xl' name={sign > 0 ? 'south_west' : 'north_east'} />
      </span>
      <div className='min-w-0'>
        <p className='font-semibold text-on-surface'>{t(`wallet.types.${transaction.type}`)}</p>
        <p className='text-xs text-on-surface-variant'>
          <time dateTime={transaction.createdAt}>{dateTime(transaction.createdAt)}</time>
          {transaction.bookingId && bookingHref && !onOpen ? (
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
      <div className='col-start-2 text-left sm:col-start-3 sm:text-right'>
        <p className={`font-bold tabular-nums ${sign > 0 ? 'text-mint-500' : 'text-on-surface'}`}>
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
    </>
  )

  if (!onOpen) return <li className={grid}>{content}</li>
  return (
    <li>
      <button
        aria-label={t('wallet.detail.openTransaction', {
          type: t(`wallet.types.${transaction.type}`),
          amount: money(transaction.amount)
        })}
        className={`${grid} -mx-2 w-[calc(100%+1rem)] rounded-2xl px-2 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary`}
        onClick={onOpen}
        type='button'
      >
        {content}
      </button>
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
  const [size, setSize] = useState(WALLET_PAGE_SIZE)
  const [selected, setSelected] = useState<WalletTransactionRecord | null>(null)
  const transactions = useQuery({
    queryKey: walletKeys.transactions(range.from, range.to, page, size),
    queryFn: () => fetchMyWalletTransactions(range.from, range.to, page, size),
    retry: false
  })

  return (
    <section className='rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'>
      <h2 className='text-lg font-bold tracking-tight text-forest-950'>{t('wallet.transactions.title')}</h2>
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
              <WalletTransactionRow
                bookingHref={bookingHref}
                key={transaction.id}
                onOpen={() => setSelected(transaction)}
                transaction={transaction}
              />
            ))}
          </ul>
          <Pagination
            className='mt-4'
            onPageChange={(next) => setPageState({ rangeKey: range.from, page: next })}
            onPageSizeChange={(next) => {
              setSize(next)
              setPageState({ rangeKey: range.from, page: 0 })
            }}
            page={page}
            pageSize={size}
            totalElements={transactions.data.totalElements}
            totalPages={transactions.data.totalPages}
          />
        </>
      ) : null}
      {selected ? (
        <WalletTransactionDetailDialog
          bookingHref={bookingHref}
          onClose={() => setSelected(null)}
          transaction={selected}
        />
      ) : null}
    </section>
  )
}
