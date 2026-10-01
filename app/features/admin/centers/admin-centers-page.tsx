import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { centersPreview } from './centers-preview'

const key = 'admin.centersPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'

function csvCell(value: string | number) {
  const cell = String(value)
  return `"${(/^[=+@-]/.test(cell) ? `'${cell}` : cell).replaceAll('"', '""')}"`
}

export function AdminCentersPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const get = (name: string) => params.get(name) ?? ''
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'center') next.delete('center')
      return next
    })
  }
  const tab = get('tab') === 'pending' || get('tab') === 'active' || get('tab') === 'suspended' ? get('tab') : 'all'
  const search = get('q').trim().toLocaleLowerCase(locale)
  const filtered = centersPreview.filter((center) => {
    const matchesSearch =
      !search ||
      [center.name, center.id, center.business, center.representative].some((value) =>
        value.toLocaleLowerCase(locale).includes(search)
      )
    return (
      matchesSearch &&
      (tab === 'all' || center.status === tab) &&
      (!get('region') || center.region === get('region')) &&
      (!get('status') || center.status === get('status')) &&
      (!get('accreditation') || center.accreditation === get('accreditation'))
    )
  })
  const selected = centersPreview.find((center) => center.id === get('center'))
  useDocumentTitle(t(`${key}.documentTitle`))
  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        t(`${key}.columns.center`),
        t(`${key}.businessLicense`),
        t(`${key}.operationLicense`),
        t(`${key}.representative`),
        t(`${key}.status`)
      ],
      ...filtered.map((center) => [
        center.id + ' ' + center.name,
        center.business,
        center.license ?? '',
        center.representative,
        t(`${key}.statuses.${center.status}`)
      ])
    ]
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-centers-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('admin.menu')} className='flex items-center gap-2 text-xs text-outline'>
        <Link to='/admin/dashboard'>{t('admin.dashboard')}</Link>
        <Icon className='text-sm' name='chevron_right' />
        <span>{t(`${key}.breadcrumb`)}</span>
        <Icon className='text-sm' name='chevron_right' />
        <span className='text-primary'>{t('admin.centers')}</span>
      </nav>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          <p className='mt-2 text-xs font-semibold text-primary'>{t(`${key}.sample`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.history`)}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold disabled:opacity-50'
            disabled={!filtered.length}
            onClick={exportCsv}
            type='button'
          >
            <Icon name='download' />
            {t(`${key}.export`)}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            <Icon name='add' />
            {t(`${key}.add`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.total`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['total', 48, 'domain'],
            ['pending', 5, 'verified_user'],
            ['suspended', 3, 'lock'],
            ['staff', 860, 'medical_services']
          ] as const
        ).map(([name, value, icon]) => (
          <div className={card} key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-5 block text-3xl'>{number.format(value)}</strong>
            <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.metricHints.${name}`)}</p>
          </div>
        ))}
      </section>
      <aside className='flex items-start gap-3 rounded-xl border border-primary/15 bg-secondary-container/20 p-4'>
        <Icon className='text-xl text-primary' name='shield' />
        <div>
          <h2 className='text-sm font-bold text-primary'>{t(`${key}.safety`)}</h2>
          <p className='mt-1 text-sm leading-6 text-on-surface-variant'>{t(`${key}.safetyHint`)}</p>
        </div>
      </aside>
      <section className={`${card} space-y-4`}>
        <div className='flex flex-wrap gap-2' role='tablist' aria-label={t('admin.centers')}>
          {(['all', 'pending', 'active', 'suspended'] as const).map((item) => (
            <button
              aria-selected={tab === item}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === item ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
              key={item}
              onClick={() => update('tab', item)}
              role='tab'
              type='button'
            >
              {t(`${key}.tabs.${item}`)}
            </button>
          ))}
        </div>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.search`)}
            <input
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('q', event.target.value)}
              placeholder={t(`${key}.search`)}
              type='search'
              value={get('q')}
            />
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.region`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('region', event.target.value)}
              value={get('region') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {(['HN', 'HCM', 'DN', 'CT', 'BD'] as const).map((region) => (
                <option key={region} value={region}>
                  {t(`${key}.regions.${region}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.status`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('status', event.target.value)}
              value={get('status') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {(['active', 'pending', 'suspended'] as const).map((status) => (
                <option key={status} value={status}>
                  {t(`${key}.statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.accreditation`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('accreditation', event.target.value)}
              value={get('accreditation') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {(['BYT', 'CLINIC', 'PRIVATE'] as const).map((level) => (
                <option key={level} value={level}>
                  {t(`${key}.accreditations.${level}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='flex justify-between gap-3 px-5 py-4'>
          <h2 className='text-lg font-bold'>{t(`${key}.tabs.all`)}</h2>
          <span className='text-xs text-outline'>{t(`${key}.results`, { count: filtered.length })}</span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1000px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {(['center', 'legal', 'scale', 'status', 'actions'] as const).map((column) => (
                  <th className='px-4 py-3' key={column} scope='col'>
                    {t(`${key}.columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/25'>
              {filtered.map((center) => (
                <tr className='align-top hover:bg-surface-container-low/40' key={center.id}>
                  <td className='px-4 py-4'>
                    <button
                      className='text-left font-bold hover:text-primary'
                      onClick={() => update('center', center.id)}
                      type='button'
                    >
                      {center.name}
                    </button>
                    <small className='mt-1 block text-outline'>
                      {center.id} · {center.district}, {t(`${key}.regions.${center.region}`)}
                    </small>
                  </td>
                  <td className='px-4 py-4'>
                    <p>
                      <span className='text-outline'>{t(`${key}.businessLicense`)}: </span>
                      <strong>{center.business}</strong>
                    </p>
                    <p className='mt-1'>
                      <span className='text-outline'>{t(`${key}.operationLicense`)}: </span>
                      <strong>{center.license ?? '—'}</strong>
                    </p>
                    <small className='mt-1 block text-outline'>
                      {t(`${key}.representative`)}: {center.representative || '—'}
                    </small>
                  </td>
                  <td className='px-4 py-4'>
                    <strong>{t(`${key}.nurses`, { count: center.nurses })}</strong>
                    <small className='mt-1 block text-outline'>
                      {t(`${key}.bookings`, { count: center.bookings })}
                    </small>
                    {center.rating !== null && (
                      <small className='mt-1 block text-primary'>
                        ★ {t(`${key}.rating`, { value: number.format(center.rating), count: center.reviews })}
                      </small>
                    )}
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${center.status === 'active' ? 'bg-secondary-container/40 text-primary' : center.status === 'pending' ? 'bg-surface-container text-on-surface-variant' : 'bg-error-container text-on-error-container'}`}
                    >
                      {t(`${key}.statuses.${center.status}`)}
                    </span>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        className='rounded-lg bg-surface-container-low px-2 py-1 text-xs font-semibold text-primary'
                        onClick={() => update('center', center.id)}
                        type='button'
                      >
                        {t(`${key}.details`)}
                      </button>
                      <button
                        className='rounded-lg bg-surface-container-low px-2 py-1 text-xs font-semibold text-outline opacity-50'
                        disabled
                        title={t(`${key}.unavailable`)}
                        type='button'
                      >
                        {t(
                          `${key}.${center.status === 'pending' ? 'approve' : center.status === 'active' ? 'lock' : 'unlock'}`
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>}
        <div className='flex items-center justify-between border-t border-outline-variant/25 px-5 py-3 text-sm'>
          <button className='text-primary disabled:opacity-40' disabled type='button'>
            {t(`${key}.previous`)}
          </button>
          <span>{t(`${key}.page`, { page: 1, pages: 1 })}</span>
          <button className='text-primary disabled:opacity-40' disabled type='button'>
            {t(`${key}.next`)}
          </button>
        </div>
      </section>
      <section className={card}>
        <div className='flex items-center gap-2'>
          <Icon className='text-2xl text-primary' name='verified_user' />
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.process`)}</h2>
            <p className='text-xs text-outline'>{t(`${key}.processHint`)}</p>
          </div>
        </div>
        <ol className='mt-5 grid gap-3 md:grid-cols-4'>
          {(['first', 'second', 'third', 'fourth'] as const).map((step, index) => (
            <li className='rounded-lg bg-surface-container-low p-4' key={step}>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white'>
                {index + 1}
              </span>
              <h3 className='mt-3 text-sm font-semibold'>{t(`${key}.steps.${step}`)}</h3>
            </li>
          ))}
        </ol>
      </section>
      {selected && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) update('center', '')
          }}
          role='presentation'
        >
          <section
            aria-label={t(`${key}.detailTitle`)}
            aria-modal='true'
            className='w-full max-w-xl rounded-xl bg-white p-6 shadow-xl'
            role='dialog'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold'>{t(`${key}.detailTitle`)}</h2>
                <p className='mt-1 text-sm text-outline'>
                  {selected.name} · {selected.id}
                </p>
              </div>
              <button
                aria-label={t(`${key}.close`)}
                className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
                onClick={() => update('center', '')}
                type='button'
              >
                <Icon name='close' />
              </button>
            </div>
            <p className='mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
              {t(`${key}.recordHint`)}
            </p>
            <dl className='mt-4 space-y-3 text-sm'>
              {(
                [
                  [t(`${key}.businessLicense`), selected.business],
                  [t(`${key}.operationLicense`), selected.license ?? '—'],
                  [t(`${key}.representative`), selected.representative || '—'],
                  [t(`${key}.status`), t(`${key}.statuses.${selected.status}`)]
                ] as const
              ).map(([label, value]) => (
                <div className='flex justify-between gap-4 border-b border-outline-variant/25 pb-2' key={label}>
                  <dt className='text-outline'>{label}</dt>
                  <dd className='text-right font-semibold'>{value}</dd>
                </div>
              ))}
            </dl>
            <p className='mt-4 text-sm text-on-surface-variant'>{t(`${key}.notes.${selected.note}`)}</p>
            <div className='mt-5 text-right'>
              <button
                className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white'
                onClick={() => update('center', '')}
                type='button'
              >
                {t(`${key}.close`)}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
