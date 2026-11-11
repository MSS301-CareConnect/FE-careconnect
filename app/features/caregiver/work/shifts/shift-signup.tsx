import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  cancelMyShiftRegistration,
  providerKeys,
  registerForShift,
  updateCaregiverSchedule
} from '~/entities/provider/provider-api'
import { shiftInstant } from '~/entities/provider/work-shift'
import type { ProviderShiftRegistrationRecord, ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useMyCaregiverProfile, useMyRegistrations, useOpenShifts } from '../../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError, cgCard } from '../../ui/caregiver-page'
import { useClientPage } from '../../ui/use-client-page'
import { useNow } from '../../ui/use-now'
import { ShiftCard, type ShiftState, type ShiftView } from './shift-card'
import { RegisterShiftDialog, WithdrawShiftDialog, shiftErrorKey } from './shift-dialogs'

const FILTERS = ['open', 'pending', 'approved', 'history'] as const
type Filter = (typeof FILTERS)[number]
const ACTIVE = new Set(['PENDING', 'APPROVED'])
const SHIFTS_PER_PAGE = 9

/** Three small steps explaining what a sign-up turns into. */
function ProcessSteps() {
  const { t } = useTranslation()
  const steps = ['register', 'review', 'available'] as const
  return (
    <ol
      aria-label={t('caregiver.work.shifts.steps.label')}
      className={`${cgCard} grid grid-cols-3 gap-2 p-3 text-center`}
    >
      {steps.map((step, index) => (
        <li className='relative flex flex-col items-center gap-1' key={step}>
          <span className='grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-sm font-bold text-primary tabular-nums'>
            {index + 1}
          </span>
          <span className='text-xs leading-tight font-medium text-on-surface sm:text-sm'>
            {t(`caregiver.work.shifts.steps.${step}`)}
          </span>
          {index < steps.length - 1 ? (
            <Icon
              className='absolute top-1 -right-2 text-base text-on-surface-variant sm:right-0'
              name='chevron_right'
            />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

/** The shift part a registration carries (ProviderService 2026-11-05), so cards need no request per sign-up. */
function shiftOf(item: ProviderShiftRegistrationRecord): ShiftView {
  return {
    workDate: item.workDate ?? '',
    startTime: item.startTime ?? '',
    endTime: item.endTime ?? '',
    shiftType: item.shiftType ?? '',
    cancellationReason: item.shiftCancellationReason
  }
}

/**
 * "Đăng ký ca": a grid of shift cards with chips. "Open shifts" lists only shifts still open (the backend returns the
 * effective state) that the caregiver has not already signed up for; signed-up and approved ones live in their own
 * chips with withdraw actions.
 */
export function ShiftSignup({ centerId, centerName }: { centerId?: string; centerName?: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const now = useNow(60_000)
  const [filter, setFilter] = useState<Filter>('open')
  const [registering, setRegistering] = useState<ProviderWorkShiftRecord | null>(null)
  const [cancelling, setCancelling] = useState<ProviderShiftRegistrationRecord | null>(null)
  const [withdrawing, setWithdrawing] = useState<ProviderShiftRegistrationRecord | null>(null)
  const profile = useMyCaregiverProfile()
  const shifts = useOpenShifts(centerId)
  const registrations = useMyRegistrations()
  const items = registrations.data?.items ?? []

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations }),
      queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId ?? '') }),
      queryClient.invalidateQueries({ queryKey: providerKeys.mySchedules })
    ])
  }
  const register = useMutation({
    mutationFn: ({ shift, note }: { shift: ProviderWorkShiftRecord; note: string }) =>
      registerForShift(shift.id, { caregiverNote: note || undefined }),
    onSuccess: async () => {
      toast.success(t('caregiver.work.shifts.registered'))
      setRegistering(null)
      await refresh()
    }
  })
  const cancel = useMutation({
    mutationFn: (item: ProviderShiftRegistrationRecord) => cancelMyShiftRegistration(item.id, item.version),
    onSuccess: async () => {
      toast.success(t('caregiver.work.shifts.cancelled'))
      setCancelling(null)
      await refresh()
    }
  })
  const withdraw = useMutation({
    mutationFn: ({ item, reason }: { item: ProviderShiftRegistrationRecord; reason: string }) =>
      updateCaregiverSchedule(item.scheduleId!, { status: 'CANCELLED', reason, version: item.scheduleVersion! }),
    onSuccess: async () => {
      toast.success(t('caregiver.work.shifts.withdrawn'))
      setWithdrawing(null)
      await refresh()
    }
  })

  const activeByShift = new Map<string, ProviderShiftRegistrationRecord>()
  for (const item of items) if (ACTIVE.has(item.registrationStatus)) activeByShift.set(item.workShiftId, item)
  const startsLater = (workDate?: string, startTime?: string) =>
    Boolean(workDate && startTime) && shiftInstant(workDate!, startTime!) > now

  const openShifts = (shifts.data?.items ?? []).filter(
    (shift) =>
      shift.shiftStatus === 'OPEN' && !activeByShift.has(shift.id) && startsLater(shift.workDate, shift.startTime)
  )
  const lists: Record<Exclude<Filter, 'open'>, ProviderShiftRegistrationRecord[]> = {
    pending: [],
    approved: [],
    history: []
  }
  for (const item of items) {
    const upcoming = startsLater(item.workDate, item.startTime)
    if (item.registrationStatus === 'PENDING' && upcoming) lists.pending.push(item)
    else if (item.registrationStatus === 'APPROVED' && upcoming) lists.approved.push(item)
    else lists.history.push(item)
  }
  for (const list of [lists.pending, lists.approved])
    list.sort((a, b) => `${a.workDate}${a.startTime}`.localeCompare(`${b.workDate}${b.startTime}`))
  const counts: Record<Filter, number | undefined> = {
    open: shifts.isSuccess ? openShifts.length : undefined,
    pending: registrations.isSuccess ? lists.pending.length : undefined,
    approved: registrations.isSuccess ? lists.approved.length : undefined,
    history: undefined
  }
  // Nine cards a page (three rows on wide screens) so a long season of shifts does not stretch the page.
  const openPage = useClientPage(openShifts, SHIFTS_PER_PAGE, filter)
  const listPage = useClientPage(filter === 'open' ? [] : lists[filter], SHIFTS_PER_PAGE, filter)
  const loading = filter === 'open' ? shifts.isPending && Boolean(centerId) : registrations.isPending
  const error = filter === 'open' ? shifts.isError : registrations.isError

  function stateOf(item: ProviderShiftRegistrationRecord): ShiftState {
    return item.registrationStatus
  }

  return (
    <div className='flex flex-col gap-4'>
      {centerName ? (
        <p className='text-sm text-on-surface-variant'>
          {t('caregiver.work.shifts.centerLine', { center: centerName })}
        </p>
      ) : null}
      <ProcessSteps />
      <FilterChips
        label={t('caregiver.work.shifts.filterLabel')}
        onChange={(value) => setFilter(value as Filter)}
        options={FILTERS.map((value) => ({
          value,
          label: t(`caregiver.work.shifts.filters.${value}`),
          count: counts[value]
        }))}
        value={filter}
      />

      {!centerId && filter === 'open' ? (
        <CaregiverEmpty icon='domain_disabled' title={t('caregiver.work.shifts.noCenter')} />
      ) : null}
      {loading ? (
        <SkeletonGroup className='grid gap-3 md:grid-cols-2 xl:grid-cols-3' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-48 rounded-xl' />
          <Skeleton className='h-48 rounded-xl' />
          <Skeleton className='hidden h-48 rounded-xl xl:block' />
        </SkeletonGroup>
      ) : null}
      {error ? (
        <CaregiverError
          message={t('caregiver.work.shifts.loadError')}
          onRetry={() => void (filter === 'open' ? shifts.refetch() : registrations.refetch())}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      ) : null}

      {filter === 'open' && shifts.isSuccess ? (
        openShifts.length === 0 ? (
          <CaregiverEmpty
            description={t('caregiver.work.shifts.empty.openHint')}
            icon='event_available'
            title={t('caregiver.work.shifts.empty.open')}
          />
        ) : (
          <ul className='cg-stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3' key={`open-${openPage.page}`}>
            {openPage.items.map((shift) => (
              <li key={shift.id}>
                <ShiftCard
                  now={now}
                  onRegister={() => {
                    register.reset()
                    setRegistering(shift)
                  }}
                  shift={shift}
                  state='none'
                />
              </li>
            ))}
          </ul>
        )
      ) : null}
      {filter === 'open' && shifts.isSuccess ? (
        <Pagination
          ariaLabel={t('caregiver.work.shifts.pagination')}
          onPageChange={openPage.setPage}
          page={openPage.page}
          totalPages={openPage.totalPages}
        />
      ) : null}

      {filter !== 'open' && registrations.isSuccess ? (
        lists[filter].length === 0 ? (
          <CaregiverEmpty icon='fact_check' title={t(`caregiver.work.shifts.empty.${filter}`)} />
        ) : (
          <ul className='cg-stagger grid gap-3 md:grid-cols-2 xl:grid-cols-3' key={`${filter}-${listPage.page}`}>
            {listPage.items.map((item) => (
              <li key={item.id}>
                <ShiftCard
                  now={now}
                  onCancel={filter === 'pending' ? () => setCancelling(item) : undefined}
                  onWithdraw={
                    filter === 'approved' && item.scheduleId && item.scheduleStatus === 'SCHEDULED'
                      ? () => {
                          withdraw.reset()
                          setWithdrawing(item)
                        }
                      : undefined
                  }
                  registration={item}
                  shift={shiftOf(item)}
                  state={stateOf(item)}
                />
              </li>
            ))}
          </ul>
        )
      ) : null}
      {filter !== 'open' && registrations.isSuccess ? (
        <Pagination
          ariaLabel={t('caregiver.work.shifts.pagination')}
          onPageChange={listPage.setPage}
          page={listPage.page}
          totalPages={listPage.totalPages}
        />
      ) : null}

      {registering ? (
        <RegisterShiftDialog
          caregiverId={profile.data?.id}
          error={register.isError ? register.error : null}
          myRegistrations={items}
          onClose={() => setRegistering(null)}
          onConfirm={(note) => register.mutate({ shift: registering, note })}
          pending={register.isPending}
          shift={registering}
        />
      ) : null}
      {withdrawing ? (
        <WithdrawShiftDialog
          error={withdraw.isError ? withdraw.error : null}
          onClose={() => setWithdrawing(null)}
          onConfirm={(reason) => withdraw.mutate({ item: withdrawing, reason })}
          pending={withdraw.isPending}
          registration={withdrawing}
        />
      ) : null}
      <ConfirmDialog
        confirmLabel={t('caregiver.work.shifts.cancel')}
        description={t('caregiver.work.shifts.cancelDescription')}
        error={cancel.isError ? t(shiftErrorKey(cancel.error)) : undefined}
        loading={cancel.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (cancelling) cancel.mutate(cancelling)
        }}
        open={cancelling !== null}
        title={t('caregiver.work.shifts.cancelTitle')}
        tone='danger'
      />
    </div>
  )
}
