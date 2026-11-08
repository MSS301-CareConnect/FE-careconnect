import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import {
  changeWorkShiftStatus,
  fetchWorkShiftStatistics,
  fetchWorkShifts,
  providerKeys
} from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { addDays, calendarDayOf } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { toastSuccess, toastSystemError } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { PageHeader } from '~/shared/ui/page-header'
import { Pagination } from '~/shared/ui/pagination'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { CancelShiftDialog } from './components/cancel-shift-dialog'
import { ShiftDetailDialog } from './components/shift-detail-dialog'
import { ShiftFiltersBar } from './components/shift-filters'
import { ShiftFormDialog } from './components/shift-form-dialog'
import { ShiftStats } from './components/shift-stats'
import { ShiftTable } from './components/shift-table'
import { ShiftWeekView } from './components/shift-week-view'
import { mondayOf, useShiftFilters } from './hooks/use-shift-filters'
import type { ShiftAction } from './shift-actions'
import type { ShiftFormMode } from './shift-form-model'

const k = 'centerManager.workShifts' as const
const PAGE_SIZE = 20

type Dialog =
  | { kind: 'form'; mode: ShiftFormMode; shift?: ProviderWorkShiftRecord }
  | { kind: 'cancel'; shift: ProviderWorkShiftRecord }

/**
 * Center Manager "Work shifts": numbers for the whole filter, server-side filters in the URL, a list or a week
 * calendar, and every form / detail as a dialog. `/center-manager/work-shifts/:id` opens the same page with that
 * shift's details on top.
 */
export function ManagerWorkShiftsPage() {
  const { t } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: routeShiftId } = useParams()
  const [params, setParams] = useSearchParams()
  const now = useClock(60_000)
  const today = calendarDayOf(new Date(now))
  const filters = useShiftFilters(today)
  const [dialog, setDialog] = useState<Dialog | null>(null)
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
    size: weekView ? 100 : PAGE_SIZE
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
    else toggleStatus.mutate({ shift, target: action === 'open' ? 'OPEN' : 'CLOSED' })
  }

  if (!centerId) {
    return (
      <div className='mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6' role='alert'>
        {t(`${k}.noCenter`)}
      </div>
    )
  }

  const items = shifts.data?.items ?? []
  return (
    <div className='mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'>
      <PageHeader
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
            <ShiftTable now={now} onAction={handleAction} onOpen={openDetail} shifts={items} />
            {(shifts.data?.totalPages ?? 0) > 1 ? (
              <div className='border-t border-outline-variant/40 px-4 py-3'>
                <Pagination
                  className='border-0 shadow-none'
                  onPageChange={filters.setPage}
                  page={filters.page}
                  totalPages={shifts.data?.totalPages ?? 1}
                />
              </div>
            ) : null}
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
    </div>
  )
}

/** `/center-manager/work-shifts/:id` — the list with that shift's details open. */
export function ManagerWorkShiftDetailPage() {
  return <ManagerWorkShiftsPage />
}
