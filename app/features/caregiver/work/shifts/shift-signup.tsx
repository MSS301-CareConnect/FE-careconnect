import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  cancelMyShiftRegistration,
  fetchWorkShift,
  providerKeys,
  registerForShift
} from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderShiftRegistrationRecord, ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Drawer } from '~/shared/ui/drawer'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useMyRegistrations, useOpenShifts } from '../../data/caregiver-queries'
import { hhmm, useCaregiverFormat } from '../../ui/caregiver-format'
import { CaregiverEmpty, CaregiverError, cgCard } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'
import { ShiftCard, type ShiftState } from './shift-card'

const FILTERS = ['open', 'pending', 'approved', 'history'] as const
type Filter = (typeof FILTERS)[number]
const ACTIVE = new Set(['PENDING', 'APPROVED'])

function shiftStart(shift: ProviderWorkShiftRecord) {
  return new Date(`${shift.workDate}T${shift.startTime}`).getTime()
}

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

/** "Đăng ký ca": open shifts with the caregiver's state on each card, filtered by chips instead of two lists. */
export function ShiftSignup({ centerId, centerName }: { centerId?: string; centerName?: string }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const now = useNow(60_000)
  const [filter, setFilter] = useState<Filter>('open')
  const [registering, setRegistering] = useState<ProviderWorkShiftRecord | null>(null)
  const [note, setNote] = useState('')
  const [cancelling, setCancelling] = useState<ProviderShiftRegistrationRecord | null>(null)
  const shifts = useOpenShifts(centerId)
  const registrations = useMyRegistrations()
  const items = registrations.data?.items ?? []
  // A registration carries only the shift ID, so its date and hours come from the shift itself.
  const registeredShifts = useQueries({
    queries: items.map((item) => ({
      queryKey: providerKeys.shift(item.workShiftId),
      queryFn: () => fetchWorkShift(item.workShiftId),
      retry: false,
      staleTime: 5 * 60_000
    }))
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations })
    await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId ?? '') })
  }
  const register = useMutation({
    mutationFn: (shift: ProviderWorkShiftRecord) =>
      registerForShift(shift.id, { caregiverNote: note.trim() || undefined }),
    onSuccess: async () => {
      toast.success(t('caregiver.work.shifts.registered'))
      setRegistering(null)
      setNote('')
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

  const latestByShift = new Map<string, ProviderShiftRegistrationRecord>()
  for (const item of items) {
    const current = latestByShift.get(item.workShiftId)
    if (!current || ACTIVE.has(item.registrationStatus) || (item.createdAt ?? '') > (current.createdAt ?? ''))
      latestByShift.set(item.workShiftId, item)
  }
  function stateOf(shift: ProviderWorkShiftRecord): ShiftState {
    const registration = latestByShift.get(shift.id)
    if (registration && ACTIVE.has(registration.registrationStatus)) return registration.registrationStatus
    if (shift.registrationDeadline && new Date(shift.registrationDeadline).getTime() <= now) return 'expired'
    return registration?.registrationStatus ?? 'none'
  }

  const openShifts = (shifts.data?.items ?? []).filter((shift) => shiftStart(shift) > now)
  const registered = items
    .map((item, index) => ({ item, shift: registeredShifts[index] }))
    .filter(({ item, shift }) => {
      const past = shift?.data ? shiftStart(shift.data) <= now : false
      if (filter === 'pending') return item.registrationStatus === 'PENDING' && !past
      if (filter === 'approved') return item.registrationStatus === 'APPROVED' && !past
      return past || item.registrationStatus === 'REJECTED' || item.registrationStatus === 'CANCELLED'
    })
  const pending = filter === 'open' ? shifts.isPending && Boolean(centerId) : registrations.isPending
  const error = filter === 'open' ? shifts.isError : registrations.isError

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
        options={FILTERS.map((value) => ({ value, label: t(`caregiver.work.shifts.filters.${value}`) }))}
        value={filter}
      />

      {!centerId && filter === 'open' ? (
        <CaregiverEmpty icon='domain_disabled' title={t('caregiver.work.shifts.noCenter')} />
      ) : null}
      {pending ? (
        <SkeletonGroup className='grid gap-3 md:grid-cols-2' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-48 rounded-xl' />
          <Skeleton className='h-48 rounded-xl' />
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
          <ul className='cg-stagger grid gap-3 md:grid-cols-2'>
            {openShifts.map((shift) => {
              const state = stateOf(shift)
              const registration = latestByShift.get(shift.id)
              return (
                <li key={shift.id}>
                  <ShiftCard
                    now={now}
                    onCancel={state === 'PENDING' && registration ? () => setCancelling(registration) : undefined}
                    onRegister={
                      state === 'none' || state === 'CANCELLED' || state === 'REJECTED'
                        ? () => {
                            register.reset()
                            setNote('')
                            setRegistering(shift)
                          }
                        : undefined
                    }
                    registration={registration}
                    shift={shift}
                    state={state}
                  />
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      {filter !== 'open' && registrations.isSuccess ? (
        registered.length === 0 ? (
          <CaregiverEmpty icon='fact_check' title={t(`caregiver.work.shifts.empty.${filter}`)} />
        ) : (
          <ul className='cg-stagger grid gap-3 md:grid-cols-2'>
            {registered.map(({ item, shift }) =>
              shift?.data ? (
                <li key={item.id}>
                  <ShiftCard
                    now={now}
                    onCancel={
                      item.registrationStatus === 'PENDING' && filter === 'pending'
                        ? () => setCancelling(item)
                        : undefined
                    }
                    registration={item}
                    shift={shift.data}
                    state={item.registrationStatus}
                  />
                </li>
              ) : (
                <li className={`${cgCard} p-4 text-sm text-on-surface-variant`} key={item.id}>
                  {shift?.isError
                    ? t('caregiver.work.shifts.shiftUnavailable')
                    : t('caregiver.work.shifts.shiftLoading')}
                </li>
              )
            )}
          </ul>
        )
      ) : null}

      <Drawer
        description={
          registering
            ? t('caregiver.work.shifts.registerDescription', {
                date: format.shortDay(registering.workDate),
                start: hhmm(registering.startTime),
                end: hhmm(registering.endTime)
              })
            : undefined
        }
        footer={
          <>
            <Button onClick={() => setRegistering(null)} variant='outline'>
              {t('caregiver.ui.actions.cancel')}
            </Button>
            <Button
              loading={register.isPending}
              onClick={() => {
                if (registering) register.mutate(registering)
              }}
            >
              {t('caregiver.work.shifts.register')}
            </Button>
          </>
        }
        onClose={() => setRegistering(null)}
        open={registering !== null}
        placement='bottom'
        title={t('caregiver.work.shifts.registerTitle')}
      >
        <label className='block text-sm font-semibold text-on-surface' htmlFor='shift-registration-note'>
          {t('caregiver.work.shifts.note')}
        </label>
        <textarea
          className='mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-[15px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
          id='shift-registration-note'
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('caregiver.work.shifts.notePlaceholder')}
          value={note}
        />
        {register.isError ? (
          <p className='mt-3 rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {t(apiRequestErrorKey(register.error, 'caregiver.provider.actionError'))}
          </p>
        ) : null}
      </Drawer>

      <ConfirmDialog
        confirmLabel={t('caregiver.work.shifts.cancel')}
        description={t('caregiver.work.shifts.cancelDescription')}
        error={cancel.isError ? t(apiRequestErrorKey(cancel.error, 'caregiver.provider.actionError')) : undefined}
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
