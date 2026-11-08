import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  changeWorkShiftStatus,
  fetchShiftRegistrations,
  fetchWorkShift,
  providerKeys
} from '~/entities/provider/provider-api'
import { SHIFT_STATUS_TONES, shiftStatusLabelKey, shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderShiftRegistrationRecord, ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess, toastSystemError } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { allowedShiftActions, shiftMinutes, type ShiftAction } from '../shift-actions'
import { SHIFT_ERROR_MAP } from '../shift-form-model'
import { ShiftRegistrations } from './shift-registrations'

const k = 'centerManager.workShifts.detail' as const

interface HistoryEvent {
  at: string
  label: string
  icon: string
}

function historyOf(
  shift: ProviderWorkShiftRecord,
  registrations: ProviderShiftRegistrationRecord[],
  t: (key: string, options?: Record<string, unknown>) => string
): HistoryEvent[] {
  const events: HistoryEvent[] = []
  if (shift.createdAt) events.push({ at: shift.createdAt, label: t(`${k}.events.created`), icon: 'add_circle' })
  for (const registration of registrations) {
    const name = registration.caregiverName || t('common.ui.unknownName')
    if (registration.createdAt)
      events.push({ at: registration.createdAt, label: t(`${k}.events.registered`, { name }), icon: 'how_to_reg' })
    if (registration.reviewedAt && registration.registrationStatus === 'APPROVED')
      events.push({ at: registration.reviewedAt, label: t(`${k}.events.approved`, { name }), icon: 'check_circle' })
    if (registration.reviewedAt && registration.registrationStatus === 'REJECTED')
      events.push({ at: registration.reviewedAt, label: t(`${k}.events.rejected`, { name }), icon: 'cancel' })
    if (registration.registrationStatus === 'CANCELLED' && registration.updatedAt && !shift.cancelledAt)
      events.push({ at: registration.updatedAt, label: t(`${k}.events.withdrawn`, { name }), icon: 'undo' })
  }
  if (shift.cancelledAt) events.push({ at: shift.cancelledAt, label: t(`${k}.events.cancelled`), icon: 'event_busy' })
  else if (shift.updatedAt && shift.updatedAt !== shift.createdAt)
    events.push({ at: shift.updatedAt, label: t(`${k}.events.updated`), icon: 'edit' })
  return events.sort((a, b) => b.at.localeCompare(a.at))
}

export function ShiftDetailDialog({
  shiftId,
  centerId,
  now,
  onClose,
  onAction
}: {
  shiftId: string
  centerId: string
  now: number
  onClose: () => void
  onAction: (action: ShiftAction, shift: ProviderWorkShiftRecord) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const shift = useQuery({
    queryKey: providerKeys.shift(shiftId),
    queryFn: () => fetchWorkShift(shiftId),
    retry: false
  })
  const owned = shift.data?.centerId === centerId
  const registrations = useQuery({
    queryKey: providerKeys.registrations(shiftId),
    queryFn: () => fetchShiftRegistrations(shiftId, 0, { size: 100 }),
    enabled: owned,
    retry: false
  })
  const status = useMutation({
    mutationFn: (target: 'OPEN' | 'CLOSED') =>
      changeWorkShiftStatus(shiftId, { status: target, version: shift.data!.version }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(providerKeys.shift(shiftId), updated)
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      toastSuccess(t(updated.shiftStatus === 'OPEN' ? `${k}.success.opened` : `${k}.success.closed`))
    },
    onError: (error, target) => {
      toastSystemError(error, {
        message: t('centerManager.workShifts.form.systemError'),
        retryLabel: t('centerManager.workShifts.retry'),
        retry: () => status.mutate(target)
      })
    }
  })
  const statusFailure = status.isError ? classifyApiError(status.error, SHIFT_ERROR_MAP) : null

  const title = shift.data ? t(`${k}.title`, { date: format.dayLabel(shift.data.workDate) }) : t(`${k}.info`)
  let body: ReactNode
  let footer: ReactNode

  if (shift.isPending) {
    body = (
      <div className='grid gap-5 lg:grid-cols-12' role='status'>
        <div className='space-y-3 lg:col-span-6'>
          <Skeleton className='h-36 w-full rounded-xl' />
          <Skeleton className='h-36 w-full rounded-xl' />
        </div>
        <div className='lg:col-span-6'>
          <Skeleton className='h-72 w-full rounded-xl' />
        </div>
      </div>
    )
  } else if (shift.isError || !shift.data) {
    body = (
      <ErrorState
        message={t('centerManager.workShifts.error')}
        onRetry={() => void shift.refetch()}
        retryLabel={t('centerManager.workShifts.retry')}
      />
    )
  } else if (!owned) {
    body = <p role='alert'>{t('centerManager.workShifts.noAccess')}</p>
  } else {
    const data = shift.data
    const allowed = allowedShiftActions(data, now)
    const approved = data.approvedCount ?? 0
    const pending = data.pendingCount ?? 0
    const ratio = data.capacity > 0 ? Math.min(1, approved / data.capacity) : 0
    const history = historyOf(data, registrations.data?.items ?? [], t as never)

    footer = (
      <>
        {allowed.has('cancel') ? (
          <Button
            className='mr-auto'
            leftIcon={<Icon name='event_busy' />}
            onClick={() => onAction('cancel', data)}
            size='sm'
            variant='danger'
          >
            {t('centerManager.workShifts.actions.cancel')}
          </Button>
        ) : null}
        <Button
          leftIcon={<Icon name='content_copy' />}
          onClick={() => onAction('duplicate', data)}
          size='sm'
          variant='outline'
        >
          {t('centerManager.workShifts.actions.duplicate')}
        </Button>
        {allowed.has('open') || allowed.has('close') ? (
          <Button
            leftIcon={<Icon name={allowed.has('open') ? 'lock_open' : 'lock'} />}
            loading={status.isPending}
            onClick={() => status.mutate(allowed.has('open') ? 'OPEN' : 'CLOSED')}
            size='sm'
            variant='outline'
          >
            {t(
              allowed.has('open') ? 'centerManager.workShifts.actions.open' : 'centerManager.workShifts.actions.close'
            )}
          </Button>
        ) : null}
        {allowed.has('edit') ? (
          <Button leftIcon={<Icon name='edit' />} onClick={() => onAction('edit', data)} size='sm'>
            {t('centerManager.workShifts.actions.edit')}
          </Button>
        ) : null}
      </>
    )

    body = (
      <div className='grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6'>
        {/* Left column: Shift overview & compact timeline */}
        <div className='space-y-4 lg:col-span-6'>
          <section className='space-y-3.5 rounded-xl bg-surface-container-low/55 p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <StatusBadge dot tone={SHIFT_STATUS_TONES[data.shiftStatus]}>
                  {t(shiftStatusLabelKey(data.shiftStatus))}
                </StatusBadge>
                <span className='rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-on-surface'>
                  {t(shiftTypeLabelKey(data.shiftType))}
                </span>
              </div>
              <span className='inline-flex items-center gap-1 text-sm font-semibold text-on-surface tabular-nums'>
                <Icon className='text-base text-primary' name='schedule' />
                {data.startTime.slice(0, 5)}–{data.endTime.slice(0, 5)} · {format.duration(shiftMinutes(data))}
              </span>
            </div>

            <div className='space-y-1.5 rounded-lg bg-surface-container-lowest/80 p-3'>
              <div className='flex items-center justify-between gap-2 text-xs'>
                <span className='font-medium text-on-surface-variant'>{t(`${k}.capacity`)}</span>
                <span className='font-semibold text-on-surface tabular-nums'>
                  {t(`${k}.approvedOf`, { approved, capacity: data.capacity })} ·{' '}
                  {t(`${k}.pendingCount`, { count: pending })}
                </span>
              </div>
              <div aria-hidden='true' className='h-2 overflow-hidden rounded-full bg-surface-container'>
                <div
                  className={`h-full rounded-full transition-all ${ratio >= 1 ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>

            <dl className='divide-y divide-outline-variant/25 text-xs'>
              <div className='flex items-baseline justify-between gap-3 py-2 first:pt-0'>
                <dt className='text-on-surface-variant'>{t(`${k}.maxBookings`)}</dt>
                <dd className='font-semibold text-on-surface tabular-nums'>
                  {t(`${k}.maxBookingsValue`, { count: data.maxBookings ?? 2 })}
                </dd>
              </div>
              <div className='flex items-baseline justify-between gap-3 py-2'>
                <dt className='text-on-surface-variant'>{t(`${k}.deadline`)}</dt>
                <dd className='text-right font-semibold text-on-surface tabular-nums'>
                  {data.registrationDeadline ? format.dateTime(data.registrationDeadline) : t(`${k}.noDeadline`)}
                </dd>
              </div>
              <div className='flex items-baseline justify-between gap-3 py-2 last:pb-0'>
                <dt className='shrink-0 text-on-surface-variant'>{t(`${k}.note`)}</dt>
                <dd className='whitespace-pre-line text-right font-medium text-on-surface'>
                  {data.note || t(`${k}.noNote`)}
                </dd>
              </div>
              {data.cancellationReason ? (
                <div className='mt-2 rounded-lg bg-error-container/40 p-2.5 text-on-error-container'>
                  <dt className='font-semibold'>{t(`${k}.cancelReason`)}</dt>
                  <dd className='mt-0.5'>{data.cancellationReason}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {statusFailure && statusFailure.kind !== 'system' && statusFailure.kind !== 'field' ? (
            <FormAlert tone='warning'>{t(statusFailure.key)}</FormAlert>
          ) : null}

          <section aria-labelledby='shift-history-title' className='rounded-xl bg-surface-container-low/45 p-4'>
            <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface' id='shift-history-title'>
              <Icon className='text-base text-primary' name='history' />
              {t(`${k}.history`)}
            </h3>
            <ol className={`mt-3 ${history.length > 5 ? 'max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin]' : ''}`}>
              {history.map((event, index) => (
                <li className='relative flex items-start gap-3 pb-3 last:pb-0' key={`${event.at}-${index}`}>
                  {index < history.length - 1 ? (
                    <span
                      aria-hidden='true'
                      className='absolute top-7 bottom-0 left-3.5 -ml-px w-0.5 bg-outline-variant/50'
                    />
                  ) : null}
                  <span className='relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'>
                    <Icon className='text-sm' name={event.icon} />
                  </span>
                  <div className='min-w-0 flex-1 pt-1'>
                    <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs'>
                      <p className='font-semibold text-on-surface'>{event.label}</p>
                      <p className='text-[11px] text-on-surface-variant tabular-nums'>{format.dateTime(event.at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className='mt-2.5 text-[11px] text-outline'>{t(`${k}.historyHint`)}</p>
          </section>
        </div>

        {/* Right column: Caregiver registrations */}
        <div className='rounded-xl bg-surface-container-low/45 p-4 lg:col-span-6'>
          {registrations.isPending ? (
            <Skeleton className='h-60 w-full rounded-xl' />
          ) : registrations.isError ? (
            <ErrorState
              message={t(`${k}.loadError`)}
              onRetry={() => void registrations.refetch()}
              retryLabel={t('centerManager.workShifts.retry')}
            />
          ) : (
            <ShiftRegistrations
              canReview={data.shiftStatus === 'OPEN' || data.shiftStatus === 'CLOSED'}
              registrations={registrations.data.items}
              shiftId={shiftId}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Modal footer={footer} maxWidthClass='max-w-5xl' onClose={onClose} open title={title}>
      {body}
    </Modal>
  )
}
