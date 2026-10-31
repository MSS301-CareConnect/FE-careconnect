import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { accountKeys, fetchAccount, fetchAccounts } from '~/entities/identity/account-api'
import { fetchCenters, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { CenterForm } from './components/center-form'

const key = 'admin.centersPage' as const
const PAGE_SIZE = 20
const STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'REJECTED', 'ARCHIVED'] as const

function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

/** The center logo is its first image; the media cache is the one the detail page refreshes after an upload. */
function CenterLogo({ center }: { center: ProviderCenterRecord }) {
  const media = useQuery({
    queryKey: providerKeys.media('CARE_CENTER', center.id),
    queryFn: () => fetchProviderMedia('CARE_CENTER', center.id),
    enabled: center.centerStatus !== 'ARCHIVED',
    retry: false,
    staleTime: 60_000
  })
  return (
    <Avatar
      className='h-10 w-10 rounded-xl'
      decorative
      icon='apartment'
      name={center.centerName}
      onExpired={() => void media.refetch()}
      src={pickAvatar(media.data)?.downloadUrl}
    />
  )
}

/**
 * The manager's name from the page of manager accounts; an account outside it (locked, re-roled or removed) is
 * read on its own, and one that cannot be read shows "Unknown" instead of loading forever.
 */
function ManagerName({ userId, known, listLoaded }: { userId: string; known?: string; listLoaded: boolean }) {
  const { t } = useTranslation()
  const account = useQuery({
    queryKey: accountKeys.detail(userId),
    queryFn: () => fetchAccount(userId),
    enabled: listLoaded && !known,
    retry: false
  })
  if (known) return known
  if (!listLoaded || account.isPending) return t('common.ui.loadingName')
  return account.data?.fullName || t('common.ui.unknownName')
}

export function AdminCentersPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const status = STATUSES.find((item) => item === params.get('status'))
  const legacySelected = params.get('center')
  const [draft, setDraft] = useState(keyword)
  const [creating, setCreating] = useState(false)
  useDocumentTitle(t(`${key}.documentTitle`))

  // Links from before D-06 opened a center with `?center=<id>`; it now has its own page.
  useEffect(() => {
    if (legacySelected) navigate(`/admin/centers/${legacySelected}`, { replace: true })
  }, [legacySelected, navigate])

  const query = {
    page,
    size: PAGE_SIZE,
    status,
    keyword: keyword.trim() || undefined,
    // Archived centers are soft-deleted; ProviderService lists them only when asked to.
    ...(status === 'ARCHIVED' ? { includeDeleted: true } : {})
  }
  const centers = useQuery({
    queryKey: [...providerKeys.centers, query],
    queryFn: () => fetchCenters(query),
    placeholderData: keepPreviousData,
    retry: false
  })
  const statistics = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  const managers = useQuery({
    queryKey: accountKeys.list({ role: 'CENTER_MANAGER', page: 0, size: 100 }),
    queryFn: () => fetchAccounts({ role: 'CENTER_MANAGER', page: 0, size: 100 }),
    retry: false
  })
  const managerName = new Map((managers.data?.content ?? []).map((user) => [user.id, user.fullName]))
  const rows = centers.data?.items ?? []
  const counts = statistics.data?.centersByStatus ?? {}
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const date = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium' })

  function update(next: Record<string, string | undefined>) {
    setParams((previous) => {
      const search = new URLSearchParams(previous)
      for (const [name, value] of Object.entries(next)) {
        if (value) search.set(name, value)
        else search.delete(name)
      }
      if (!('page' in next)) search.delete('page')
      return search
    })
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: draft.trim() || undefined })
  }

  function exportCsv() {
    const lines = [
      (['center', 'email', 'phone', 'address', 'status'] as const).map((column) => t(`${key}.csv.${column}`)),
      ...rows.map((center) => [
        center.centerName,
        center.email ?? '',
        center.phoneNumber ?? '',
        center.address ?? '',
        t(`${key}.status.${center.centerStatus}`)
      ])
    ]
    const blob = new Blob(['﻿' + lines.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-centers.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className='mx-auto max-w-7xl space-y-5 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            disabled={!rows.length}
            leftIcon={<Icon className='text-lg' name='download' />}
            onClick={exportCsv}
            variant='outline'
          >
            {t(`${key}.exportPage`)}
          </Button>
          <Button leftIcon={<Icon className='text-lg' name='add' />} onClick={() => setCreating(true)}>
            {t(`${key}.add`)}
          </Button>
        </div>
      </header>

      <div
        aria-label={t(`${key}.tabsLabel`)}
        className='flex gap-1 overflow-x-auto border-b border-outline-variant/40'
        role='tablist'
      >
        {(['all', ...STATUSES] as const).map((item) => {
          const selected = (status ?? 'all') === item
          const count = item === 'all' ? undefined : counts[item]
          return (
            <button
              aria-selected={selected}
              className={`-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-semibold transition-colors ${selected ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
              key={item}
              onClick={() => update({ status: item === 'all' ? undefined : item })}
              role='tab'
              type='button'
            >
              {t(`${key}.tabs.${item}`)}
              {count ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${item === 'PENDING' ? 'bg-warning-container text-on-warning-container' : 'bg-surface-container-low text-on-surface-variant'}`}
                >
                  {number.format(count)}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <form className='flex max-w-xl gap-2' onSubmit={submitSearch} role='search'>
        <label className='sr-only' htmlFor='centers-search'>
          {t(`${key}.search`)}
        </label>
        <input
          className={`${baseControlClass} flex-1`}
          id='centers-search'
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t(`${key}.search`)}
          type='search'
          value={draft}
        />
        <Button type='submit' variant='secondary'>
          {t(`${key}.searchAction`)}
        </Button>
      </form>

      {centers.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : centers.isError ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void centers.refetch()} retryLabel={t(`${key}.retry`)} />
      ) : rows.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} icon='apartment' title={t(`${key}.empty`)} />
      ) : (
        <section className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
          <p className='border-b border-outline-variant/30 px-5 py-3 text-sm text-on-surface-variant'>
            {t(`${key}.results`, { count: centers.data.totalElements })}
          </p>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-215 text-left text-sm'>
              <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                <tr>
                  {(['center', 'contact', 'manager', 'status', 'action'] as const).map((column) => (
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
                      className={
                        archived ? 'text-on-surface-variant' : 'cursor-pointer hover:bg-surface-container-low/60'
                      }
                      key={center.id}
                      onClick={archived ? undefined : () => navigate(`/admin/centers/${center.id}`)}
                    >
                      <td className='px-4 py-3'>
                        <span className='flex items-center gap-3'>
                          <CenterLogo center={center} />
                          <span className='min-w-0'>
                            {archived ? (
                              <span className='block font-semibold'>{center.centerName}</span>
                            ) : (
                              <Link
                                className='block font-semibold text-on-surface hover:text-primary'
                                onClick={(event) => event.stopPropagation()}
                                to={`/admin/centers/${center.id}`}
                              >
                                {center.centerName}
                              </Link>
                            )}
                            <span className='block max-w-80 truncate text-xs text-on-surface-variant'>
                              {center.address || '—'}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='block'>{center.email || '—'}</span>
                        <span className='block text-xs tabular-nums text-on-surface-variant'>
                          {center.phoneNumber || '—'}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {center.managerUserId ? (
                          <ManagerName
                            known={managerName.get(center.managerUserId)}
                            listLoaded={!managers.isPending}
                            userId={center.managerUserId}
                          />
                        ) : (
                          t(`${key}.noManager`)
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <ProviderStatusBadge status={center.centerStatus}>
                          {t(`${key}.status.${center.centerStatus}`)}
                        </ProviderStatusBadge>
                      </td>
                      <td className='px-4 py-3'>
                        {archived ? (
                          <span className='text-xs'>
                            {center.updatedAt
                              ? t(`${key}.archivedOn`, { date: date.format(new Date(center.updatedAt)) })
                              : t(`${key}.status.ARCHIVED`)}
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary'>
                            {center.centerStatus === 'PENDING' ? t(`${key}.reviewAction`) : t(`${key}.open`)}
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
          {status === 'ARCHIVED' ? (
            <p className='border-t border-outline-variant/30 px-5 py-3 text-sm text-on-surface-variant'>
              {t(`${key}.archivedHint`)}
            </p>
          ) : null}
        </section>
      )}
      {centers.isSuccess ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          page={page}
          totalPages={centers.data.totalPages}
        />
      ) : null}
      {creating ? (
        <Modal
          description={t(`${key}.form.createHint`)}
          maxWidthClass='max-w-2xl'
          onClose={() => setCreating(false)}
          open
          title={t(`${key}.form.createTitle`)}
        >
          <CenterForm
            onCancel={() => setCreating(false)}
            onSaved={(saved) => {
              setCreating(false)
              navigate(`/admin/centers/${saved.id}`)
            }}
          />
        </Modal>
      ) : null}
    </main>
  )
}
