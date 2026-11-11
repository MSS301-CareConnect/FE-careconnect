import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { fetchCaregiverDirectory, providerKeys, verifyCaregiver } from '~/entities/provider/provider-api'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import { useCenterOptions } from '~/features/admin/data/use-center-options'
import { AdminStatCards } from '~/features/admin/ui/stat-cards'
import { classifyApiError } from '~/shared/api/api-error'
import type {
  ListProviderCaregiverDirectoryParams,
  ProviderCaregiverRecord,
  VerificationRequest
} from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { Select } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Pagination, pageSizeOf } from '~/shared/ui/pagination'
import { SearchInput } from '~/shared/ui/search-input'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { CaregiverDirectoryRow } from './components/caregiver-directory-row'

const key = 'admin.caregiverQueuePage' as const
const DEFAULT_PAGE_SIZE = 10
const VERIFICATIONS = ['PENDING', 'VERIFIED', 'REJECTED'] as const
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const
const STAT_ICONS = { PENDING: 'pending_actions', VERIFIED: 'verified', REJECTED: 'block' } as const
const statusKeys = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended' } as const

/** Rows arrive ordered by center, so one pass folds the page into a group per center. */
function groupByCenter(items: readonly ProviderCaregiverRecord[]) {
  const groups: { centerId: string; centerName?: string; rows: ProviderCaregiverRecord[] }[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last?.centerId === item.centerId) last.rows.push(item)
    else groups.push({ centerId: item.centerId, centerName: item.centerName, rows: [item] })
  }
  return groups
}

/**
 * Caregivers of every center (2026-11-11, formerly only the verification queue, M-13): count cards that filter by
 * review state, a name search, a center and a work-status filter, and the page's caregivers under their center.
 * ProviderService filters, orders (center, then name) and pages; every filter lives in URL search parameters. A
 * pending profile is approved or rejected (with a reason) on its row; certificates are reviewed on the center's page.
 */
export function AdminCaregiverQueuePage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.title`))
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') ?? '0') || 0, 0)
  const pageSize = pageSizeOf(params.get('size'), DEFAULT_PAGE_SIZE)
  const verification = VERIFICATIONS.find((item) => item === params.get('verification'))
  const status = STATUSES.find((item) => item === params.get('status'))
  const centerId = params.get('center') || undefined
  const keyword = params.get('q') ?? ''
  const [rejecting, setRejecting] = useState<ProviderCaregiverRecord | null>(null)
  const queryClient = useQueryClient()
  const query: ListProviderCaregiverDirectoryParams = {
    centerId,
    verification,
    status,
    keyword: keyword.trim() || undefined,
    page,
    size: pageSize
  }
  const directory = useQuery({
    queryKey: providerKeys.caregiverDirectory(query),
    queryFn: () => fetchCaregiverDirectory(query),
    placeholderData: keepPreviousData,
    retry: false
  })
  const statistics = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  const centers = useCenterOptions(true)
  const notify = useActionToast()
  const decide = useMutation({
    mutationFn: ({ id, request }: { id: string; request: VerificationRequest; name: string }) =>
      verifyCaregiver(id, request),
    onSuccess: (_saved, { request, name }) => {
      setRejecting(null)
      notify.success(
        t(request.status === 'VERIFIED' ? 'admin.toast.caregivers.verified' : 'admin.toast.caregivers.rejected', {
          name
        })
      )
      void queryClient.invalidateQueries({ queryKey: statisticsKeys.providers })
      return queryClient.invalidateQueries({ queryKey: ['provider'] })
    },
    onError: (error, variables) => {
      if (notify.systemError(error, t('admin.toast.caregivers.actions.review'), () => decide.mutate(variables)))
        setRejecting(null)
    }
  })
  const decideFailed = decide.isError && classifyApiError(decide.error).kind !== 'system'

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in changes)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const byVerification = statistics.data?.caregiversByVerification
  const stats = [
    {
      id: 'all',
      icon: 'groups',
      label: t(`${key}.stats.all`),
      value: byVerification ? Object.values(byVerification).reduce((sum, count) => sum + count, 0) : undefined,
      selected: !verification,
      onSelect: () => update({ verification: undefined })
    },
    ...VERIFICATIONS.map((item) => ({
      id: item,
      icon: STAT_ICONS[item],
      label: t(`${key}.stats.${item}`),
      value: byVerification ? (byVerification[item] ?? 0) : undefined,
      selected: verification === item,
      onSelect: () => update({ verification: verification === item ? undefined : item })
    }))
  ]
  const items = directory.data?.items ?? []
  const hasFilters = Boolean(verification || status || centerId || keyword)

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t(`${key}.description`)} title={t(`${key}.title`)} />

      <AdminStatCards items={stats} label={t(`${key}.stats.label`)} />

      <section className={`${bentoCard} flex flex-wrap items-end gap-3 p-4`}>
        <SearchInput
          className='min-w-56 flex-1'
          label={t(`${key}.search`)}
          onChange={(value) => update({ q: value.trim() || undefined })}
          placeholder={t(`${key}.search`)}
          value={keyword}
        />
        <label className='flex min-w-52 flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.center`)}
          <Select onChange={(event) => update({ center: event.target.value || undefined })} value={centerId ?? ''}>
            <option value=''>{t(`${key}.allCenters`)}</option>
            {(centers.data ?? []).map((center) => (
              <option key={center.id} value={center.id}>
                {center.centerName}
              </option>
            ))}
          </Select>
        </label>
        <label className='flex min-w-44 flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.columns.status`)}
          <Select onChange={(event) => update({ status: event.target.value || undefined })} value={status ?? ''}>
            <option value=''>{t(`${key}.allStatuses`)}</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.provider.${statusKeys[item]}`)}
              </option>
            ))}
          </Select>
        </label>
        {hasFilters ? (
          <Button
            onClick={() => update({ verification: undefined, status: undefined, center: undefined, q: undefined })}
            variant='ghost'
          >
            {t(`${key}.reset`)}
          </Button>
        ) : null}
      </section>

      {decideFailed && !rejecting ? (
        <p className='text-sm text-error' role='alert'>
          {t(`${key}.decideError`)}
        </p>
      ) : null}
      {directory.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={5} />
      ) : directory.isError ? (
        <ErrorState
          message={t(`${key}.error`)}
          onRetry={() => void directory.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      ) : items.length === 0 ? (
        <EmptyState
          description={hasFilters ? t(`${key}.emptyFilteredHint`) : undefined}
          icon={verification === 'PENDING' ? 'verified' : 'person_search'}
          title={t(verification === 'PENDING' ? `${key}.empty` : `${key}.emptyAll`)}
        />
      ) : (
        <>
          {groupByCenter(items).map((group) => (
            <section className={`${bentoCard} overflow-hidden`} key={group.centerId}>
              <header className='flex flex-wrap items-center gap-3 border-b border-outline-variant/30 bg-surface-container-low/50 px-5 py-3'>
                <span
                  aria-hidden='true'
                  className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-900 text-mint-300'
                >
                  <Icon className='text-lg' name='apartment' />
                </span>
                <h2 className='min-w-0 flex-1 truncate text-base font-bold text-forest-950'>
                  {group.centerName ?? t('common.ui.unknownName')}
                </h2>
                <span className='rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-forest-900 tabular-nums'>
                  {t(`${key}.onPage`, { count: group.rows.length })}
                </span>
                <Link
                  className='inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-primary'
                  to={`/admin/centers/${group.centerId}?tab=staff`}
                >
                  {t(`${key}.openCenter`)}
                  <Icon className='text-base' name='chevron_right' />
                </Link>
              </header>
              <ul className='divide-y divide-outline-variant/25'>
                {group.rows.map((caregiver) => (
                  <CaregiverDirectoryRow
                    busy={decide.isPending}
                    caregiver={caregiver}
                    key={caregiver.id}
                    onApprove={() =>
                      decide.mutate({
                        id: caregiver.id,
                        request: { status: 'VERIFIED', version: caregiver.version },
                        name: caregiver.fullName
                      })
                    }
                    onReject={() => {
                      decide.reset()
                      setRejecting(caregiver)
                    }}
                  />
                ))}
              </ul>
            </section>
          ))}
          <Pagination
            ariaLabel={t(`${key}.pagination`)}
            onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
            onPageSizeChange={(size) => update({ size: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })}
            page={directory.data.page}
            pageSize={pageSize}
            totalElements={directory.data.totalElements}
            totalPages={directory.data.totalPages}
          />
        </>
      )}
      {rejecting ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.reject`)}
          danger
          description={t(`${key}.rejectHint`, { name: rejecting.fullName })}
          error={decideFailed ? t(`${key}.decideError`) : undefined}
          label={t(`${key}.reason`)}
          maxLength={500}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) =>
            decide.mutate({
              id: rejecting.id,
              request: { status: 'REJECTED', reason, version: rejecting.version },
              name: rejecting.fullName
            })
          }
          pending={decide.isPending}
          title={t(`${key}.rejectTitle`)}
        />
      ) : null}
    </div>
  )
}
