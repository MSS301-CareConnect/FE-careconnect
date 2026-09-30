import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { managerBookingPreviews } from './booking-preview'
import { BookingFilters } from './components/booking-filters'
import { BookingPreviewDialog } from './components/booking-preview-dialog'
import { BookingTableRow } from './components/booking-table-row'
import { useManagerBookingList } from './hooks/use-manager-booking-list'

const columns = [
  'bookingId',
  'customer',
  'patient',
  'caregiver',
  'medicalService',
  'appointment',
  'status',
  'actions'
] as const
function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

export function ManagerBookingManagementPage() {
  const { t, i18n } = useTranslation()
  const list = useManagerBookingList()
  const number = (value: number) => new Intl.NumberFormat(list.locale).format(value)
  const selected = managerBookingPreviews.find((booking) => booking.id === list.get('booking'))
  const stats = [
    {
      key: 'total',
      icon: 'calendar_month',
      value: number(list.periodRecords.length),
      detail: t('centerManager.bookingManagement.completedCount', { count: list.counts.completed })
    },
    {
      key: 'running',
      icon: 'schedule',
      value: number(list.counts.inProgress),
      detail: t('centerManager.bookingManagement.runningCount', { count: list.counts.inProgress })
    },
    {
      key: 'pendingTotal',
      icon: 'pending_actions',
      value: number(list.counts.pending),
      detail: t('centerManager.bookingManagement.pendingCount', { count: list.counts.pending })
    },
    {
      key: 'revenue',
      icon: 'payments',
      value: new Intl.NumberFormat(list.locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(42850),
      detail: t('centerManager.bookingManagement.revenueDetail')
    }
  ] as const
  useDocumentTitle(t('centerManager.bookingManagement.documentTitle'))

  function exportCsv() {
    const date = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'vi', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
    const rows = [
      columns.slice(0, -1).map((column) => t(`centerManager.bookingManagement.${column}`)),
      ...list.filtered.map((booking) => [
        booking.id,
        booking.customer,
        booking.patient,
        booking.caregiver ?? t('centerManager.bookingManagement.unassigned'),
        booking.serviceName,
        date.format(new Date(`${booking.date}T00:00:00Z`)),
        t(`centerManager.bookingManagement.statuses.${booking.status}`)
      ])
    ]
    const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'manager-bookings-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <p className='mb-3 flex items-center gap-2 text-xs text-outline'>
          <Icon className='text-base' name='admin_panel_settings' />
          {t('centerManager.portal')}
          <Icon className='text-base' name='chevron_right' />
          {t('centerManager.bookingManagement.list')}
        </p>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
                {t('centerManager.bookingManagement.title')}
              </h1>
              <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                {t('centerManager.bookingManagement.monthlyCount', { count: managerBookingPreviews.length })}
              </span>
            </div>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>
              {t('centerManager.bookingManagement.subtitle')}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-sm font-semibold disabled:opacity-50'
              disabled={!list.filtered.length}
              onClick={exportCsv}
              type='button'
            >
              <Icon className='text-lg' name='download' />
              {t('centerManager.bookingManagement.export')}
            </button>
            <button
              className='flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white opacity-60'
              disabled
              title={t('centerManager.unavailable')}
              type='button'
            >
              <Icon className='text-lg' name='add' />
              {t('centerManager.bookingManagement.create')}
            </button>
          </div>
        </div>
      </header>
      <p className='rounded-lg bg-secondary-container/45 px-4 py-3 text-xs leading-5 text-primary'>
        {t('centerManager.bookingManagement.preview')}
      </p>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                {t(`centerManager.bookingManagement.${stat.key}`)}
              </h2>
              <Icon className='text-2xl text-primary' name={stat.icon} />
            </div>
            <p className='mt-3 text-3xl font-extrabold'>{stat.value}</p>
            <p className='mt-2 text-xs text-outline'>{stat.detail}</p>
          </section>
        ))}
      </div>
      <BookingFilters list={list} />
      <section
        className='overflow-hidden rounded-xl bg-white shadow-sm'
        aria-label={t('centerManager.bookingManagement.list')}
      >
        <div className='flex items-center justify-between gap-3 border-b border-outline-variant/25 px-5 py-4'>
          <h2 className='text-lg font-bold'>{t('centerManager.bookingManagement.list')}</h2>
          <span className='text-xs text-outline'>{t('centerManager.bookingManagement.snapshot')}</span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1180px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {columns.map((column) => (
                  <th className='p-4 font-semibold' key={column} scope='col'>
                    {t(`centerManager.bookingManagement.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.shown.map((booking) => (
                <BookingTableRow booking={booking} key={booking.id} onView={(id) => list.update('booking', id)} />
              ))}
            </tbody>
          </table>
        </div>
        {!list.shown.length && (
          <div className='px-5 py-16 text-center'>
            <Icon className='text-4xl text-outline' name='event_busy' />
            <h3 className='mt-3 text-base font-bold'>{t('centerManager.bookingManagement.empty')}</h3>
            <p className='mt-2 text-sm text-outline'>{t('centerManager.bookingManagement.emptyHint')}</p>
          </div>
        )}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/25 px-5 py-4 text-xs text-on-surface-variant'>
          <p>
            {t('centerManager.bookingManagement.showing', {
              from: list.filtered.length ? (list.page - 1) * list.perPage + 1 : 0,
              to: Math.min(list.page * list.perPage, list.filtered.length),
              total: list.filtered.length
            })}
          </p>
          <div className='flex items-center gap-2'>
            <label className='flex items-center gap-2'>
              {t('centerManager.bookingManagement.pageSize')}
              <select
                className='rounded-lg bg-surface-container-low px-2 py-2'
                onChange={(event) => list.update('size', event.target.value)}
                value={list.perPage}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {number(size)}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label={t('centerManager.bookingManagement.previous')}
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
              aria-label={t('centerManager.bookingManagement.next')}
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
      <button
        className='flex cursor-not-allowed items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-primary opacity-60 shadow-sm'
        disabled
        title={t('centerManager.bookingManagement.mapHint')}
        type='button'
      >
        <Icon name='map' />
        {t('centerManager.bookingManagement.map')}
      </button>
      {selected && <BookingPreviewDialog booking={selected} onClose={() => list.update('booking', '')} />}
    </div>
  )
}
