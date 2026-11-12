import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import {
  changeWorkShiftStatus,
  fetchShiftRegistrations,
  fetchWorkShiftStatistics,
  fetchWorkShifts,
  providerKeys,
  removeWorkShift,
  reviewShiftRegistration
} from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { apiErrorCode } from '~/shared/api/error-details'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { addDays, calendarDayOf, mondayOf, useFormat } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { toastSuccess, toastSystemError, toastWarning } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'
import { CancelShiftDialog } from './components/cancel-shift-dialog'
import { ShiftDetailDialog } from './components/shift-detail-dialog'
import { ShiftFiltersBar } from './components/shift-filters'
import { ShiftFormDialog } from './components/shift-form-dialog'
import { ShiftStats } from './components/shift-stats'
import { ShiftTable } from './components/shift-table'
import { ShiftWeekView } from './components/shift-week-view'
import { SHIFT_PAGE_SIZES, useShiftFilters } from './hooks/use-shift-filters'
import { allowedShiftActions, BULK_SHIFT_ACTIONS, type BulkShiftAction, type ShiftAction } from './shift-actions'
import type { ShiftFormMode } from './shift-form-model'

const k = 'centerManager.workShifts' as const

type Dialog =
  | { kind: 'form'; mode: ShiftFormMode; shift?: ProviderWorkShiftRecord }
  | { kind: 'cancel'; shift: ProviderWorkShiftRecord }
  | { kind: 'delete'; shift: ProviderWorkShiftRecord }
  | { kind: 'bulkDelete' }

// shortcut: no cross-shift approve endpoint, and the per-shift bulk review is all-or-nothing, so sign-ups are approved one
// by one (earliest first, up to the free places, first 50 pending) and a conflict / time off only skips that caregiver;
// add a batch endpoint if this gets slow.
async function approvePending(shift: ProviderWorkShiftRecord) {
  const pending = (await fetchShiftRegistrations(shift.id, 0, { status: 'PENDING', size: 50 })).items
    .filter((registration) => registration.registrationStatus === 'PENDING')
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
  let approved = 0
  for (const registration of pending.slice(0, shift.capacity - (shift.approvedCount ?? 0))) {
    try {
      await reviewShiftRegistration(registration.id, { status: 'APPROVED', version: registration.version })
      approved++
    } catch {
      // Left pending for the manager to review in the shift detail.
    }
  }
  return { approved, skipped: pending.length - approved }
}

/**
 * Center Manager "Work shifts": numbers for the whole filter, server-side filters in the URL, a list or a week
 * calendar, and every form / detail as a dialog. `/center-manager/work-shifts/:id` opens the same page with that
 * shift's details on top.
 */
export function ManagerWorkShiftsPage() {
  const { t } = useTranslation()
  const format = useFormat()
  const centerId = useAuthUser()?.centerId ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: routeShiftId } = useParams()
  const [params, setParams] = useSearchParams()
  const now = useClock(60_000)
  const today = calendarDayOf(new Date(now))
  const filters = useShiftFilters(today)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const detailId = routeShiftId ?? params.get('shift') ?? undefined
  useDocumentTitle(t(`${k}.title`))

  const common = {
    centerId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    shiftType: filters.type || undefined
  }
  const stats = useQuery({
    queryKey: [...providerKeys.shiftStatistics(centerId), common],
    queryFn: () => fetchWorkShiftStatistics(common),
    enabled: Boolean(centerId),
    placeholderData: keepPreviousData
  })
  const weekView = filters.view === 'week'
  const listParams = {
    ...common,
    ...(weekView ? { fromDate: filters.week, toDate: addDays(filters.week, 6) } : {}),
    status: filters.status,
    hasVacancy: filters.vacancy || undefined,
    hasPending: filters.pending || undefined,
    page: weekView ? 0 : filters.page,
    size: weekView ? 100 : filters.size
  }
  const shifts = useQuery({
    queryKey: [...providerKeys.shifts(centerId), 'list', listParams],
    queryFn: () => fetchWorkShifts(listParams),
    enabled: Boolean(centerId) && !filters.rangeInvalid,
    placeholderData: keepPreviousData
  })
  const toggleStatus = useMutation({
    mutationFn: ({ shift, target }: { shift: ProviderWorkShiftRecord; target: 'OPEN' | 'CLOSED' }) =>
      changeWorkShiftStatus(shift.id, { status: target, version: shift.version }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(providerKeys.shift(updated.id), updated)
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      toastSuccess(t(updated.shiftStatus === 'OPEN' ? `${k}.detail.success.opened` : `${k}.detail.success.closed`))
    },
    onError: (error) => {
      if (!toastSystemError(error, { message: t(`${k}.form.systemError`) }))
        toastSystemError(new Error('business'), { message: t(`${k}.form.business.statusInvalid`) })
    }
  })

  const remove = useMutation({
    mutationFn: (shift: ProviderWorkShiftRecord) => removeWorkShift(shift.id, shift.version),
    onSuccess: async (_, shift) => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      toastSuccess(t(`${k}.remove.success`, { date: format.date(shift.workDate) }))
      setDialog(null)
    }
  })
  // shortcut: ProviderService has no bulk status / delete endpoint, so the selected shifts are sent one by one (at most
  // one page, 50 rows); add a batch endpoint if pages grow or the action must be all-or-nothing.
  const bulk = useMutation({
    mutationFn: async (action: BulkShiftAction) => {
      const chosen = (shifts.data?.items ?? []).filter((shift) => selectedIds.has(shift.id))
      const allowed = chosen.filter((shift) => allowedShiftActions(shift, now).has(action))
      const results = await Promise.allSettled(
        allowed.map((shift) =>
          action === 'delete'
            ? removeWorkShift(shift.id, shift.version)
            : changeWorkShiftStatus(shift.id, { status: action === 'open' ? 'OPEN' : 'CLOSED', version: shift.version })
        )
      )
      const done = results.filter((item) => item.status === 'fulfilled').length
      return { done, skipped: chosen.length - done }
    },
    onSuccess: async ({ done, skipped }) => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      setSelectedIds(new Set())
      setDialog(null)
      toastSuccess(skipped ? t(`${k}.bulk.partly`, { done, skipped }) : t(`${k}.bulk.done`, { count: done }))
    }
  })
  const quickApprove = useMutation({
    mutationFn: async (list: ProviderWorkShiftRecord[]) => {
      const results = await Promise.allSettled(
        list.filter((shift) => allowedShiftActions(shift, now).has('approve')).map(approvePending)
      )
      let approved = 0
      let skipped = 0
      for (const result of results) {
        if (result.status === 'fulfilled') {
          approved += result.value.approved
          skipped += result.value.skipped
        }
      }
      return { approved, skipped }
    },
    onSuccess: async ({ approved, skipped }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) }),
        queryClient.invalidateQueries({ queryKey: ['provider', 'registrations'] })
      ])
      setSelectedIds(new Set())
      if (approved === 0) toastWarning(t(`${k}.quickApprove.none`))
      else if (skipped) toastSuccess(t(`${k}.quickApprove.partly`, { approved, skipped }))
      else toastSuccess(t(`${k}.quickApprove.done`, { count: approved }))
    }
  })

  function openDetail(shift: ProviderWorkShiftRecord) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set('shift', shift.id)
        return next
      },
      { replace: false }
    )
  }

  function closeDetail() {
    if (routeShiftId) {
      navigate(`/center-manager/work-shifts${params.toString() ? `?${params}` : ''}`, { replace: true })
      return
    }
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('shift')
      return next
    })
  }

  function handleAction(action: ShiftAction, shift: ProviderWorkShiftRecord) {
    if (action === 'view') openDetail(shift)
    // The detail stays in the URL underneath: closing the form or the cancel dialog returns to it.
    else if (action === 'edit' || action === 'duplicate') setDialog({ kind: 'form', mode: action, shift })
    else if (action === 'cancel') setDialog({ kind: 'cancel', shift })
    else if (action === 'approve') quickApprove.mutate([shift])
    else if (action === 'delete') {
      remove.reset()
      setDialog({ kind: 'delete', shift })
    } else toggleStatus.mutate({ shift, target: action === 'open' ? 'OPEN' : 'CLOSED' })
  }

  if (!centerId) {
    return (
      <div className='mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6' role='alert'>
        {t(`${k}.noCenter`)}
      </div>
    )
  }

  const items = shifts.data?.items ?? []
  // Only rows still on screen count: a filter or page change drops the rest of the selection.
  const selected = items.filter((shift) => selectedIds.has(shift.id))
  return (
    <div className='mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'>
      <BentoPageHeader
        actions={
          <Button leftIcon={<Icon name='add' />} onClick={() => setDialog({ kind: 'form', mode: 'create' })}>
            {t(`${k}.create`)}
          </Button>
        }
        description={t(`${k}.subtitle`)}
        title={t(`${k}.title`)}
      />
      <ShiftStats
        loading={stats.isPending}
        onShowPending={() => {
          filters.setPending(!filters.pending)
        }}
        pendingActive={filters.pending}
        onShowUnderstaffed={filters.toggleUnderstaffed}
        understaffedActive={filters.understaffed}
        stats={stats.data}
      />
      <ShiftFiltersBar
        filters={filters}
        stats={stats.data}
        trailing={
          <>
            <p aria-live='polite' className='text-sm whitespace-nowrap text-on-surface-variant tabular-nums'>
              {shifts.data && !weekView ? t(`${k}.table.total`, { count: shifts.data.totalElements }) : null}
            </p>
            <SegmentedControl
              legend={t(`${k}.view.label`)}
              onChange={filters.setView}
              options={[
                { value: 'table', label: t(`${k}.view.table`) },
                { value: 'week', label: t(`${k}.view.week`) }
              ]}
              value={filters.view}
            />
          </>
        }
      />
      <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest'>
        {shifts.isPending && !filters.rangeInvalid ? (
          <SkeletonBlock className='m-4 border-0 shadow-none' label={t('common.ui.loadingName')} rows={6} />
        ) : shifts.isError ? (
          <ErrorState message={t(`${k}.error`)} onRetry={() => void shifts.refetch()} retryLabel={t(`${k}.retry`)} />
        ) : weekView ? (
          <ShiftWeekView
            monday={filters.week}
            onOpen={openDetail}
            onWeek={(day) => filters.setWeek(mondayOf(day))}
            shifts={items}
            today={today}
            truncated={(shifts.data?.totalElements ?? 0) > items.length}
          />
        ) : items.length === 0 ? (
          <EmptyState
            action={
              filters.active ? (
                <Button onClick={filters.clear} variant='outline'>
                  {t(`${k}.filters.clear`)}
                </Button>
              ) : (
                <Button leftIcon={<Icon name='add' />} onClick={() => setDialog({ kind: 'form', mode: 'create' })}>
                  {t(`${k}.create`)}
                </Button>
              )
            }
            description={t(filters.active ? `${k}.empty.filteredHint` : `${k}.empty.hint`)}
            title={t(filters.active ? `${k}.empty.filteredTitle` : `${k}.empty.title`)}
          />
        ) : (
          <>
            {selected.length > 0 ? (
              <div
                aria-label={t(`${k}.bulk.selected`, { count: selected.length })}
                className='flex flex-wrap items-center gap-2 border-b border-outline-variant/40 bg-mint-50 px-4 py-2.5'
                role='group'
              >
                <span className='mr-1 text-sm font-semibold text-forest-900 tabular-nums'>
                  {t(`${k}.bulk.selected`, { count: selected.length })}
                </span>
                <Button
                  disabled={!selected.some((shift) => allowedShiftActions(shift, now).has('approve'))}
                  leftIcon={<Icon name='how_to_reg' />}
                  loading={quickApprove.isPending}
                  onClick={() => quickApprove.mutate(selected)}
                  size='sm'
                >
                  {t(`${k}.quickApprove.button`, {
                    count: selected.reduce(
                      (sum, shift) =>
                        sum +
                        (allowedShiftActions(shift, now).has('approve')
                          ? Math.min(shift.pendingCount ?? 0, shift.capacity - (shift.approvedCount ?? 0))
                          : 0),
                      0
                    )
                  })}
                </Button>
                {BULK_SHIFT_ACTIONS.map((action) => (
                  <Button
                    disabled={!selected.some((shift) => allowedShiftActions(shift, now).has(action))}
                    key={action}
                    leftIcon={<Icon name={action === 'open' ? 'lock_open' : action === 'close' ? 'lock' : 'delete'} />}
                    loading={bulk.isPending && bulk.variables === action}
                    onClick={() => (action === 'delete' ? setDialog({ kind: 'bulkDelete' }) : bulk.mutate(action))}
                    size='sm'
                    variant={action === 'delete' ? 'danger' : 'outline'}
                  >
                    {t(`${k}.bulk.${action}`)}
                  </Button>
                ))}
                <Button onClick={() => setSelectedIds(new Set())} size='sm' variant='ghost'>
                  {t(`${k}.bulk.clear`)}
                </Button>
              </div>
            ) : null}
            <ShiftTable
              now={now}
              onAction={handleAction}
              onOpen={openDetail}
              onToggle={(shift) =>
                setSelectedIds((current) => {
                  const next = new Set(current)
                  if (next.has(shift.id)) next.delete(shift.id)
                  else next.add(shift.id)
                  return next
                })
              }
              onToggleAll={(checked) => setSelectedIds(checked ? new Set(items.map((shift) => shift.id)) : new Set())}
              selectedIds={selectedIds}
              shifts={items}
            />
            <Pagination
              className='rounded-none border-0 border-t border-outline-variant/40 shadow-none'
              onPageChange={filters.setPage}
              onPageSizeChange={filters.setSize}
              page={filters.page}
              pageSize={filters.size}
              pageSizeOptions={SHIFT_PAGE_SIZES}
              totalElements={shifts.data?.totalElements}
              totalPages={shifts.data?.totalPages ?? 1}
            />
          </>
        )}
      </section>

      {detailId && !dialog ? (
        <ShiftDetailDialog
          centerId={centerId}
          now={now}
          onAction={handleAction}
          onClose={closeDetail}
          shiftId={detailId}
        />
      ) : null}
      {dialog?.kind === 'form' ? (
        <ShiftFormDialog
          centerId={centerId}
          key={`${dialog.mode}-${dialog.shift?.id ?? 'new'}`}
          mode={dialog.mode}
          now={now}
          onClose={() => setDialog(null)}
          shift={dialog.shift}
          today={today}
        />
      ) : null}
      {dialog?.kind === 'cancel' ? (
        <CancelShiftDialog centerId={centerId} onClose={() => setDialog(null)} shift={dialog.shift} />
      ) : null}
      {dialog?.kind === 'delete' ? (
        <ConfirmDialog
          confirmLabel={t(`${k}.remove.confirm`)}
          danger
          description={t(`${k}.remove.hint`)}
          error={
            remove.isError
              ? t(apiErrorCode(remove.error) === 4306 ? `${k}.remove.hasApproved` : `${k}.form.systemError`)
              : undefined
          }
          loading={remove.isPending}
          onClose={() => setDialog(null)}
          onConfirm={() => remove.mutate(dialog.shift)}
          open
          title={t(`${k}.remove.title`, { date: format.date(dialog.shift.workDate) })}
        />
      ) : null}
      {dialog?.kind === 'bulkDelete' ? (
        <ConfirmDialog
          confirmLabel={t(`${k}.bulk.delete`)}
          danger
          description={t(`${k}.bulk.deleteHint`)}
          loading={bulk.isPending}
          onClose={() => setDialog(null)}
          onConfirm={() => bulk.mutate('delete')}
          open
          title={t(`${k}.bulk.deleteTitle`, { count: selected.length })}
        />
      ) : null}
    </div>
  )
}

/** `/center-manager/work-shifts/:id` — the list with that shift's details open. */
export function ManagerWorkShiftDetailPage() {
  return <ManagerWorkShiftsPage />
}
