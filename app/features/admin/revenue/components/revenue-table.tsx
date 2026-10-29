import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { RevenueList } from '../hooks/use-revenue-list'
import type { RevenueTransaction } from '../revenue-preview'

const key = 'admin.revenuePage' as const
const columns = ['transactionId', 'booking', 'party', 'method', 'amount', 'status', 'actions'] as const
const statusStyle = {
  escrow: 'bg-surface-container-high text-primary',
  settled: 'bg-secondary-container text-primary',
  pending: 'bg-error-container text-on-error-container',
  refunded: 'bg-surface-container text-on-surface-variant',
  reconciled: 'bg-secondary-container text-primary',
  failed: 'bg-error-container text-on-error-container'
} as const

export function RevenueTable({ list, onView }: { list: RevenueList; onView: (id: string) => void }) {
  const { t } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(list.locale).format(value)
  const money = (value: number) =>
    new Intl.NumberFormat(list.locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  const date = (value: string) =>
    new Intl.DateTimeFormat(list.locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(new Date(value))
  return (
    <section aria-label={t(`${key}.tableTitle`)} className='overflow-hidden rounded-xl bg-white shadow-sm'>
      <div className='border-b border-outline-variant/25 px-5 py-4'>
        <h2 className='text-lg font-bold'>{t(`${key}.tableTitle`)}</h2>
      </div>
      <div className='max-h-[70vh] overflow-x-auto'>
        <table className='w-full min-w-[1060px] text-left text-sm'>
          <thead className='sticky top-0 z-10 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
            <tr>
              {columns.map((column) => (
                <th className='p-4 font-semibold' key={column} scope='col'>
                  {t(`${key}.${column}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.shown.map((transaction) => (
              <RevenueRow date={date} key={transaction.id} money={money} onView={onView} transaction={transaction} />
            ))}
          </tbody>
        </table>
      </div>
      {!list.shown.length && (
        <div className='px-5 py-16 text-center'>
          <Icon className='text-4xl text-outline' name='receipt_long' />
          <h3 className='mt-3 font-bold'>{t(`${key}.empty`)}</h3>
          <p className='mt-2 text-sm text-outline'>{t(`${key}.emptyHint`)}</p>
        </div>
      )}
      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/25 px-5 py-4 text-xs text-on-surface-variant'>
        <p>
          {t(`${key}.showing`, {
            from: list.filtered.length ? (list.page - 1) * list.perPage + 1 : 0,
            to: Math.min(list.page * list.perPage, list.filtered.length),
            total: list.filtered.length
          })}
        </p>
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-2'>
            {t(`${key}.pageSize`)}
            <select
              className='rounded-lg bg-surface-container-low px-2 py-2'
              onChange={(event) => list.update('size', event.target.value)}
              value={list.perPage}
            >
              {[5, 10, 25].map((size) => (
                <option key={size} value={size}>
                  {number(size)}
                </option>
              ))}
            </select>
          </label>
          <button
            aria-label={t(`${key}.previous`)}
            className='rounded-lg border border-outline-variant/50 px-3 py-2 disabled:opacity-40'
            disabled={list.page <= 1}
            onClick={() => list.update('page', String(list.page - 1))}
            type='button'
          >
            <Icon name='chevron_left' />
          </button>
          <span>
            {number(list.page)} / {number(list.pages)}
          </span>
          <button
            aria-label={t(`${key}.next`)}
            className='rounded-lg border border-outline-variant/50 px-3 py-2 disabled:opacity-40'
            disabled={list.page >= list.pages}
            onClick={() => list.update('page', String(list.page + 1))}
            type='button'
          >
            <Icon name='chevron_right' />
          </button>
        </div>
      </div>
    </section>
  )
}

function RevenueRow({
  transaction,
  onView,
  date,
  money
}: {
  transaction: RevenueTransaction
  onView: (id: string) => void
  date: (value: string) => string
  money: (value: number) => string
}) {
  const { t } = useTranslation()
  return (
    <tr className='border-t border-outline-variant/25 align-top hover:bg-surface-container-low/50'>
      <td className='p-4'>
        <button className='font-bold text-primary hover:underline' onClick={() => onView(transaction.id)} type='button'>
          #{transaction.id}
        </button>
        <p className='mt-1 text-xs text-outline'>{date(transaction.createdAt)}</p>
        <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.types.${transaction.type}`)}</p>
      </td>
      <td className='p-4'>
        <p className='font-semibold'>{transaction.bookingId ? `#${transaction.bookingId}` : t(`${key}.noBooking`)}</p>
        {transaction.service && (
          <p className='mt-1 min-w-32 text-xs text-outline'>{t(`${key}.services.${transaction.service}`)}</p>
        )}
      </td>
      <td className='p-4'>
        <p className='min-w-32 font-semibold'>{transaction.party}</p>
        <p className='mt-1 text-xs text-outline'>
          {transaction.counterparty ?? (transaction.type === 'deposit' ? t(`${key}.escrowParty`) : '')}
        </p>
      </td>
      <td className='p-4'>
        <p className='min-w-24 text-xs font-semibold'>{transaction.method}</p>
      </td>
      <td
        className={`p-4 text-right font-bold tabular-nums ${transaction.amount > 0 ? 'text-primary' : 'text-on-surface'}`}
      >
        {transaction.amount > 0 ? '+' : ''}
        {money(transaction.amount)}
      </td>
      <td className='p-4'>
        <span
          className={`inline-flex min-w-28 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[transaction.status]}`}
        >
          {t(`${key}.statuses.${transaction.status}`)}
        </span>
      </td>
      <td className='p-4'>
        <div className='flex justify-end gap-1'>
          <button
            aria-label={t(`${key}.view`, { id: transaction.id })}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary-container'
            onClick={() => onView(transaction.id)}
            type='button'
          >
            <Icon name='visibility' />
          </button>
          {transaction.status === 'pending' && (
            <button
              className='rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white disabled:opacity-55'
              disabled
              title={t('admin.unavailable')}
              type='button'
            >
              {t(`${key}.approval`)}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
