import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { customersPreview } from './customers-preview'

const key = 'admin.customersPage' as const
const pageSize = 5

function csvCell(value: string | number) {
  const text = String(value)
  return `"${(/^[=+@-]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`
}

export function AdminCustomersPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const number = new Intl.NumberFormat(locale)
  const get = (name: string) => params.get(name) ?? ''
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }
  const search = get('q').trim().toLocaleLowerCase()
  const filtered = customersPreview
    .filter(
      (customer) =>
        !search ||
        [customer.name, customer.id, customer.email, customer.phone].some((value) =>
          value.toLocaleLowerCase().includes(search)
        )
    )
    .filter((customer) => !get('status') || customer.status === get('status'))
    .filter((customer) => !get('region') || customer.region === get('region'))
    .filter((customer) => {
      switch (get('volume')) {
        case 'booked':
          return customer.bookings > 0
        case 'new':
          return customer.bookings === 0
        case 'vip':
          return customer.bookings > 5
        case 'high':
          return customer.bookings > 15
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (get('sort')) {
        case 'active':
          return b.recentAt.localeCompare(a.recentAt)
        case 'spent':
          return b.spentUsd - a.spentUsd
        case 'bookings':
          return b.bookings - a.bookings
        default:
          return b.joinedAt.localeCompare(a.joinedAt)
      }
    })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(pages, Math.max(1, Number.parseInt(get('page'), 10) || 1))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  useDocumentTitle(t(`${key}.documentTitle`))

  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        t(`${key}.columns.customer`),
        t(`${key}.columns.contact`),
        t(`${key}.columns.patient`),
        t(`${key}.columns.bookings`),
        t(`${key}.columns.status`)
      ],
      ...filtered.map((customer) => [
        customer.id + ' ' + customer.name,
        customer.email,
        customer.patients,
        customer.bookings,
        t(`${key}.statuses.${customer.status}`)
      ])
    ]
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-customers-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('admin.menu')} className='flex items-center gap-2 text-xs text-outline'>
        <Link to='/admin/dashboard'>{t('admin.dashboard')}</Link>
        <Icon className='text-sm' name='chevron_right' />
        <span className='text-primary'>{t(`${key}.title`)}</span>
      </nav>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          <p className='mt-2 text-xs font-semibold text-primary'>{t(`${key}.sample`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold disabled:opacity-50'
            disabled={!filtered.length}
            onClick={exportCsv}
            type='button'
          >
            <Icon name='file_download' />
            {t(`${key}.export`)}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            <Icon name='person_add' />
            {t(`${key}.add`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.total`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['total', '1,240', 'groups'],
            ['new', '138', 'person_add'],
            ['locked', '14', 'lock'],
            ['retention', '82.4%', 'monitoring']
          ] as const
        ).map(([name, value, icon]) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-on-surface-variant'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <p className='mt-4 text-3xl font-bold'>
              {name === 'retention' ? value : number.format(Number(value.replace(',', '')))}
            </p>
            <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.metricHints.${name}`)}</p>
          </div>
        ))}
      </section>
      <section aria-label={t(`${key}.sort`)} className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
        <div className='relative'>
          <Icon className='absolute left-3 top-3 text-xl text-outline' name='search' />
          <input
            aria-label={t(`${key}.search`)}
            className='w-full rounded-lg bg-surface-container-low py-3 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
            onChange={(event) => update('q', event.target.value)}
            placeholder={t(`${key}.search`)}
            type='search'
            value={get('q')}
          />
        </div>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {(
            [
              ['status', 'status', ['all', 'active', 'locked', 'pending']],
              ['volume', 'bookingsFilter', ['all', 'booked', 'new', 'vip', 'high']],
              ['region', 'region', ['all', 'hcm', 'hn', 'dn', 'other']],
              ['sort', 'sort', ['newest', 'active', 'spent', 'bookings']]
            ] as const
          ).map(([param, label, options]) => (
            <label className='text-xs font-semibold text-on-surface-variant' key={param}>
              {t(`${key}.${label}`)}
              <select
                className='mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface'
                onChange={(event) => update(param, event.target.value)}
                value={get(param) || options[0]}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {param === 'status'
                      ? option === 'all'
                        ? t(`${key}.all`)
                        : t(`${key}.statuses.${option as 'active' | 'locked' | 'pending'}`)
                      : param === 'volume'
                        ? t(`${key}.bookingOptions.${option as 'all' | 'booked' | 'new' | 'vip' | 'high'}`)
                        : param === 'region'
                          ? t(`${key}.regionOptions.${option as 'all' | 'hcm' | 'hn' | 'dn' | 'other'}`)
                          : t(`${key}.sortOptions.${option as 'newest' | 'active' | 'spent' | 'bookings'}`)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className='flex items-center justify-between gap-3'>
          <span className='text-sm text-on-surface-variant'>{t(`${key}.results`, { count: filtered.length })}</span>
          <button className='text-sm font-semibold text-primary' onClick={() => setParams({})} type='button'>
            {t(`${key}.reset`)}
          </button>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1080px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {(['customer', 'contact', 'patient', 'bookings', 'recent', 'status', 'action'] as const).map(
                  (column) => (
                    <th className='px-4 py-4' key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/20'>
              {visible.map((customer) => (
                <tr className='hover:bg-surface-container-low/50' key={customer.id}>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-primary'>
                        {customer.name
                          .split(' ')
                          .slice(-2)
                          .map((part) => part[0])
                          .join('')}
                      </span>
                      <span>
                        <Link className='font-bold hover:text-primary' to={`/admin/customers/${customer.id}`}>
                          {customer.name}
                        </Link>
                        <small className='block text-outline'>
                          #{customer.id} · {t(`${key}.joined`)}:{' '}
                          {date.format(new Date(`${customer.joinedAt}T00:00:00+07:00`))}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <span className='block'>{customer.phone}</span>
                    <span className='text-xs text-outline'>{customer.email}</span>
                  </td>
                  <td className='px-4 py-4'>
                    <strong>{t(`${key}.patientCount`, { count: customer.patients })}</strong>
                    <small className='block max-w-44 truncate text-outline'>{customer.patientSummary}</small>
                  </td>
                  <td className='px-4 py-4'>
                    <strong>{t(`${key}.completedCount`, { count: customer.bookings })}</strong>
                    <small className='block text-outline'>{money.format(customer.spentUsd)}</small>
                  </td>
                  <td className='px-4 py-4'>{date.format(new Date(customer.recentAt))}</td>
                  <td className='px-4 py-4'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${customer.status === 'active' ? 'bg-secondary-container/40 text-primary' : 'bg-error-container text-on-error-container'}`}
                    >
                      {t(`${key}.statuses.${customer.status}`)}
                    </span>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-2'>
                      <Link
                        aria-label={`${t(`${key}.view`)}: ${customer.name}`}
                        className='rounded-lg p-2 text-primary hover:bg-surface-container-low'
                        to={`/admin/customers/${customer.id}`}
                      >
                        <Icon name='visibility' />
                      </Link>
                      <button
                        className='rounded-lg px-2 py-1 text-xs font-semibold text-outline'
                        disabled
                        title={t(`${key}.unavailable`)}
                        type='button'
                      >
                        {t(`${key}.${customer.status === 'locked' ? 'unlock' : 'lock'}`)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>}
        <div className='flex items-center justify-between border-t border-outline-variant/25 px-4 py-3 text-sm'>
          <button
            className='text-primary disabled:opacity-40'
            disabled={page <= 1}
            onClick={() => update('page', String(page - 1))}
            type='button'
          >
            {t(`${key}.previous`)}
          </button>
          <span>{t(`${key}.page`, { page, pages })}</span>
          <button
            className='text-primary disabled:opacity-40'
            disabled={page >= pages}
            onClick={() => update('page', String(page + 1))}
            type='button'
          >
            {t(`${key}.next`)}
          </button>
        </div>
      </section>
    </div>
  )
}
