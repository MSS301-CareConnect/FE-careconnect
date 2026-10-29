import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { CenterDetails, CenterForm } from './admin-centers-live-page'

const key = 'admin.centersPage' as const
const providerKey = 'admin.provider' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'
const statuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED'] as const
const statusKeys = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
  ARCHIVED: 'archived'
} as const

function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

export function AdminCentersPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const status = statuses.find((item) => item === params.get('status'))
  const selected = params.get('center')
  const centers = useQuery({
    queryKey: [...providerKeys.centers, { page, status, keyword }],
    queryFn: () =>
      fetchCenters({
        page,
        size: 20,
        status,
        keyword: keyword.trim() || undefined,
        // Archived centers are soft-deleted; ProviderService lists them only when asked to.
        ...(status === 'ARCHIVED' ? { includeDeleted: true } : {})
      }),
    retry: false
  })
  useDocumentTitle(t(`${key}.documentTitle`))
  const overlayOpen = creating || Boolean(selected)
  useEffect(() => {
    if (!overlayOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setCreating(false)
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        next.delete('center')
        return next
      })
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [overlayOpen, setParams])

  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'page' && name !== 'center') next.delete('page')
      return next
    })
  }

  function exportCsv() {
    if (!centers.data) return
    const rows = [
      [t(`${key}.columns.center`), t(`${providerKey}.email`), t(`${providerKey}.address`), t(`${key}.status`)],
      ...centers.data.items.map((center) => [
        center.centerName,
        center.email ?? '',
        center.address ?? '',
        t(`${providerKey}.${statusKeys[center.centerStatus]}`)
      ])
    ]
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-centers.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const rows = centers.data?.items ?? []
  // M-15: platform-wide counts per status from ProviderService; the page's rows only fill in while they load.
  const statistics = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  const pageCount = (statusValue: string) =>
    statistics.data?.centersByStatus?.[statusValue] ??
    rows.filter((center) => center.centerStatus === statusValue).length
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold disabled:opacity-50'
            disabled={!rows.length}
            onClick={exportCsv}
            type='button'
          >
            <Icon name='download' />
            {t('admin.provider.export')}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white'
            onClick={() => setCreating(true)}
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
            ['total', centers.data?.totalElements ?? 0, 'domain'],
            ['pending', pageCount('PENDING'), 'verified_user'],
            ['suspended', pageCount('SUSPENDED'), 'lock'],
            ['active', pageCount('ACTIVE'), 'medical_services']
          ] as const
        ).map(([name, value, icon]) => (
          <div className={card} key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>
                {name === 'active' ? t('admin.provider.metricsScope.activeLabel') : t(`${key}.metrics.${name}`)}
              </span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-5 block text-3xl tabular-nums'>
              {centers.isSuccess ? number.format(value) : '—'}
            </strong>
            <p className='mt-2 text-xs text-on-surface-variant'>
              {name !== 'total' && statistics.isSuccess
                ? t('admin.provider.metricsScope.platform')
                : t(`admin.provider.metricsScope.${name}`)}
            </p>
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
        <div aria-label={t('admin.centers')} className='flex flex-wrap gap-2' role='tablist'>
          {(['all', 'PENDING', 'ACTIVE', 'SUSPENDED'] as const).map((item) => (
            <button
              aria-selected={(status ?? 'all') === item}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${(status ?? 'all') === item ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
              key={item}
              onClick={() => update('status', item)}
              role='tab'
              type='button'
            >
              {item === 'all' ? t(`${key}.tabs.all`) : t(`${providerKey}.${statusKeys[item]}`)}
            </button>
          ))}
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.search`)}
            <input
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('q', event.target.value)}
              placeholder={t(`${key}.search`)}
              type='search'
              value={keyword}
            />
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.status`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('status', event.target.value)}
              value={status ?? ''}
            >
              <option value=''>{t(`${key}.all`)}</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {t(`${providerKey}.${statusKeys[item]}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='flex justify-between gap-3 px-5 py-4'>
          <h2 className='text-lg font-bold'>{t(`${key}.tabs.all`)}</h2>
          <span className='text-xs text-outline'>
            {t(`${key}.results`, { count: centers.data?.totalElements ?? 0 })}
          </span>
        </div>
        {centers.isPending ? (
          <p className='p-8' role='status'>
            {t(`${providerKey}.loading`)}
          </p>
        ) : null}
        {centers.isError ? (
          <div className='p-8' role='alert'>
            <p>{t(`${providerKey}.centersLoadError`)}</p>
            <button className='mt-3 text-primary underline' onClick={() => void centers.refetch()} type='button'>
              {t(`${providerKey}.retry`)}
            </button>
          </div>
        ) : null}
        {centers.isSuccess ? (
          <div className='max-h-[70vh] overflow-x-auto'>
            <table className='w-full min-w-[850px] text-left text-sm'>
              <thead className='sticky top-0 z-10 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
                <tr>
                  {(['center', 'legal', 'status', 'actions'] as const).map((column) => (
                    <th className='px-4 py-3' key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/25'>
                {rows.map((center) => {
                  // ProviderService cannot open an archived center, so its row is read-only.
                  const archived = center.centerStatus === 'ARCHIVED'
                  return (
                    <tr
                      className={`align-top ${archived ? 'text-on-surface-variant' : 'cursor-pointer hover:bg-surface-container-low/60'}`}
                      key={center.id}
                      onClick={archived ? undefined : () => update('center', center.id)}
                    >
                      <td className='px-4 py-4'>
                        {archived ? (
                          <span className='font-bold'>{center.centerName}</span>
                        ) : (
                          <button
                            className='text-left font-bold hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'
                            onClick={(event) => {
                              event.stopPropagation()
                              update('center', center.id)
                            }}
                            type='button'
                          >
                            {center.centerName}
                          </button>
                        )}
                        <small className='mt-1 block text-on-surface-variant'>{center.address || '—'}</small>
                      </td>
                      <td className='px-4 py-4'>
                        <p>{center.email || '—'}</p>
                        <small className='mt-1 block text-on-surface-variant'>{center.phoneNumber || '—'}</small>
                      </td>
                      <td className='px-4 py-4'>
                        <ProviderStatusBadge status={center.centerStatus}>
                          {t(`${providerKey}.${statusKeys[center.centerStatus]}`)}
                        </ProviderStatusBadge>
                      </td>
                      <td className='px-4 py-4'>
                        {archived ? (
                          <small className='block max-w-48 text-on-surface-variant'>
                            {center.updatedAt
                              ? t(`${providerKey}.archivedOn`, { date: dateFormat.format(new Date(center.updatedAt)) })
                              : t(`${providerKey}.archived`)}
                          </small>
                        ) : (
                          <span className='inline-flex items-center gap-1 text-xs font-semibold text-primary'>
                            {t(`${providerKey}.centerDetails`)}
                            <Icon className='text-base' name='chevron_right' />
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {centers.isSuccess && status === 'ARCHIVED' && rows.length ? (
          <p className='border-t border-outline-variant/25 px-5 py-3 text-sm text-on-surface-variant'>
            {t(`${providerKey}.archivedHint`)}
          </p>
        ) : null}
        {centers.isSuccess && !rows.length ? (
          <p className='p-8 text-center text-sm text-outline'>{t(`${providerKey}.centersEmpty`)}</p>
        ) : null}
        {centers.isSuccess ? (
          <div className='flex items-center justify-between border-t border-outline-variant/25 px-5 py-3 text-sm'>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page === 0}
              onClick={() => update('page', String(page - 1))}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, centers.data.totalPages) })}</span>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page + 1 >= centers.data.totalPages}
              onClick={() => update('page', String(page + 1))}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        ) : null}
      </section>
      {creating ? (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-on-surface/50 p-4'>
          <div className='mx-auto my-10 max-w-2xl'>
            <CenterForm onDone={() => setCreating(false)} />
          </div>
        </div>
      ) : null}
      {selected ? (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-on-surface/50 p-4'>
          <div className='mx-auto my-10 max-w-2xl'>
            <CenterDetails id={selected} key={selected} onClose={() => update('center', '')} />
          </div>
        </div>
      ) : null}
    </main>
  )
}
