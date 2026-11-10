import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'
import { RevenueAnalytics } from './components/revenue-analytics'
import { RevenueFilters } from './components/revenue-filters'
import { RevenueTable } from './components/revenue-table'
import { TransactionPreviewDialog } from './components/transaction-preview-dialog'
import { useRevenueList } from './hooks/use-revenue-list'
import { revenuePreview as data } from './revenue-preview'

const key = 'admin.revenuePage' as const
function csvCell(value: string | number) {
  if (typeof value === 'number') return String(value)
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

export function AdminRevenuePage() {
  const { t } = useTranslation()
  const list = useRevenueList()
  const money = (value: number) =>
    new Intl.NumberFormat(list.locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  const selected = data.transactions.find((transaction) => transaction.id === list.get('transaction'))
  const stats = [
    { key: 'gmv', icon: 'payments', value: money(data.gmv) },
    { key: 'net', icon: 'trending_up', value: money(data.gmv * data.platformRate) },
    { key: 'escrow', icon: 'lock', value: money(data.escrow) },
    { key: 'payout', icon: 'account_balance_wallet', value: money(data.payoutPending) }
  ] as const
  useDocumentTitle(t(`${key}.documentTitle`))
  function exportCsv() {
    const date = new Intl.DateTimeFormat(list.locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    })
    const rows: (string | number)[][] = [
      [
        t(`${key}.transactionId`),
        t(`${key}.booking`),
        t(`${key}.type`),
        t(`${key}.party`),
        t(`${key}.method`),
        t(`${key}.amount`),
        t(`${key}.status`)
      ],
      ...list.filtered.map((transaction) => [
        `${transaction.id} ${date.format(new Date(transaction.createdAt))}`,
        transaction.bookingId ?? '',
        t(`${key}.types.${transaction.type}`),
        transaction.party,
        transaction.method,
        transaction.amount,
        t(`${key}.statuses.${transaction.status}`)
      ])
    ]
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-transactions-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader
        actions={
          <button
            className='inline-flex min-h-11 items-center gap-1 rounded-full border border-forest-900/10 bg-white px-4 text-sm font-semibold text-forest-900 hover:bg-mint-50 disabled:opacity-50'
            disabled={!list.filtered.length}
            onClick={exportCsv}
            type='button'
          >
            <Icon className='mr-1 text-base' name='download' />
            {t(`${key}.export`)}
          </button>
        }
        description={t(`${key}.subtitle`)}
        eyebrow={t(`${key}.period`)}
        title={t(`${key}.title`)}
      />
      <p className='rounded-2xl bg-peach-50 px-4 py-3 text-xs leading-5 text-peach-700 ring-1 ring-peach-200'>
        {t('admin.preview')}
      </p>
      <div className='ops-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat, index) => (
          <section
            className={`rounded-2xl border border-forest-900/[0.06] bg-white p-5 shadow-[var(--shadow-card)] ${index === 0 ? 'ops-stat-dark' : ''}`}
            key={stat.key}
          >
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
                {t(`${key}.kpis.${stat.key}`)}
              </h2>
              <span className='ops-stat-icon flex h-10 w-10 items-center justify-center rounded-full bg-mint-50 text-primary'>
                <Icon name={stat.icon} />
              </span>
            </div>
            <p className='ops-stat-value mt-4 text-[26px] font-extrabold tracking-tight text-forest-950 tabular-nums'>
              {stat.value}
            </p>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.kpis.${stat.key}Hint`)}</p>
          </section>
        ))}
      </div>
      <RevenueAnalytics />
      <RevenueFilters list={list} />
      <RevenueTable list={list} onView={(id) => list.update('transaction', id)} />
      <section className='flex items-start gap-3 rounded-xl bg-secondary-container/45 p-5'>
        <Icon className='text-primary' name='verified_user' />
        <div>
          <h2 className='text-sm font-bold'>{t(`${key}.trustTitle`)}</h2>
          <p className='mt-1 text-xs leading-6 text-on-surface-variant'>{t(`${key}.trustText`)}</p>
        </div>
      </section>
      {selected && <TransactionPreviewDialog onClose={() => list.update('transaction', '')} transaction={selected} />}
    </div>
  )
}
