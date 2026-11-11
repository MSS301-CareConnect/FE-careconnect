import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { accountKeys, fetchAccounts } from '~/entities/identity/account-api'
import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import { AdminStatCards } from '~/features/admin/ui/stat-cards'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import {
  BentoPageHeader,
  bentoCard,
  bentoContainer,
  bentoTabClass,
  bentoTabList
} from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Pagination, pageSizeOf } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { ArchiveCenterDialog } from './components/archive-center-dialog'
import { CenterForm } from './components/center-form'
import { CentersTable } from './components/centers-table'

const key = 'admin.centersPage' as const
const DEFAULT_PAGE_SIZE = 10
const STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'REJECTED', 'ARCHIVED'] as const
type Status = (typeof STATUSES)[number]
const STAT_STATUSES = [
  { status: 'ACTIVE', icon: 'verified' },
  { status: 'PENDING', icon: 'pending_actions' },
  { status: 'SUSPENDED', icon: 'lock' }
] as const

function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

/**
 * Centers of the platform (redesigned 2026-11-11): count cards and status tabs from `/care-centers/statistics`, a
 * server keyword search, and one page of centers whose rows open, edit (dialog) or archive a center. Status, keyword,
 * page and page size live in URL search parameters; ProviderService filters and pages.
 */
export function AdminCentersPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const pageSize = pageSizeOf(params.get('size'), DEFAULT_PAGE_SIZE)
  const keyword = params.get('q') ?? ''
  const status = STATUSES.find((item) => item === params.get('status'))
  const legacySelected = params.get('center')
  const [draft, setDraft] = useState(keyword)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ProviderCenterRecord | null>(null)
  const [archiving, setArchiving] = useState<ProviderCenterRecord | null>(null)
  useDocumentTitle(t(`${key}.documentTitle`))

  // Links from before D-06 opened a center with `?center=<id>`; it now has its own page.
  useEffect(() => {
    if (legacySelected) navigate(`/admin/centers/${legacySelected}`, { replace: true })
  }, [legacySelected, navigate])

  const query = {
    page,
    size: pageSize,
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
  const counts: Partial<Record<Status, number>> = statistics.data?.centersByStatus ?? {}
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')

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

  const stats = [
    {
      id: 'all',
      icon: 'apartment',
      label: t(`${key}.stats.total`),
      // Archived centers left the managed list, so the total leaves them out.
      value: statistics.data
        ? STATUSES.filter((item) => item !== 'ARCHIVED').reduce((sum, item) => sum + (counts[item] ?? 0), 0)
        : undefined,
      selected: !status,
      onSelect: () => update({ status: undefined })
    },
    ...STAT_STATUSES.map((item) => ({
      id: item.status,
      icon: item.icon,
      label: t(`${key}.status.${item.status}`),
      value: statistics.data ? (counts[item.status] ?? 0) : undefined,
      selected: status === item.status,
      onSelect: () => update({ status: status === item.status ? undefined : item.status })
    }))
  ]

  return (
    <main className={bentoContainer}>
      <BentoPageHeader
        actions={
          <>
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
          </>
        }
        description={t(`${key}.subtitle`)}
        title={t(`${key}.title`)}
      />

      <AdminStatCards items={stats} label={t(`${key}.stats.label`)} />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div aria-label={t(`${key}.tabsLabel`)} className={bentoTabList} role='tablist'>
          {(['all', ...STATUSES] as const).map((item) => {
            const selected = (status ?? 'all') === item
            const count = item === 'all' ? undefined : counts[item]
            return (
              <button
                aria-selected={selected}
                className={bentoTabClass(selected)}
                key={item}
                onClick={() => update({ status: item === 'all' ? undefined : item })}
                role='tab'
                type='button'
              >
                {t(`${key}.tabs.${item}`)}
                {count ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${item === 'PENDING' ? 'bg-peach-300 text-forest-950' : selected ? 'bg-mint-300 text-forest-950' : 'bg-surface-container-low text-on-surface-variant'}`}
                  >
                    {number.format(count)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <form className='flex min-w-64 flex-1 gap-2 sm:max-w-md' onSubmit={submitSearch} role='search'>
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
      </div>

      {centers.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : centers.isError ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void centers.refetch()} retryLabel={t(`${key}.retry`)} />
      ) : rows.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} icon='apartment' title={t(`${key}.empty`)} />
      ) : (
        <section className={`${bentoCard} overflow-hidden`}>
          <CentersTable
            managerName={managerName}
            managersLoaded={!managers.isPending}
            onArchive={setArchiving}
            onEdit={setEditing}
            rows={rows}
          />
          {status === 'ARCHIVED' ? (
            <p className='flex items-start gap-2 border-t border-outline-variant/30 px-5 py-3 text-sm text-on-surface-variant'>
              <Icon className='mt-0.5 text-base' name='info' />
              {t(`${key}.archivedHint`)}
            </p>
          ) : null}
        </section>
      )}
      {centers.isSuccess ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          onPageSizeChange={(size) => update({ size: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })}
          page={page}
          pageSize={pageSize}
          totalElements={centers.data.totalElements}
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
      {editing ? (
        <Modal maxWidthClass='max-w-2xl' onClose={() => setEditing(null)} open title={t(`${key}.form.editTitle`)}>
          <CenterForm center={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
        </Modal>
      ) : null}
      {archiving ? <ArchiveCenterDialog center={archiving} onClose={() => setArchiving(null)} /> : null}
    </main>
  )
}
