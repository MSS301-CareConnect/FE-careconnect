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
import { Modal, ModalColumns } from '~/shared/ui/modal'
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
  let body
  if (shift.isPending) {
    body = (
      <div className='space-y-3' role='status'>
        <Skeleton className='h-6 w-1/2 rounded-md' />
        <Skeleton className='h-24 w-full rounded-xl' />
        <Skeleton className='h-40 w-full rounded-xl' />
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
    const rows: [string, string][] = [
      [
        t('centerManager.workShifts.table.time'),
        `${data.startTime.slice(0, 5)}–${data.endTime.slice(0, 5)} · ${format.duration(shiftMinutes(data))}`
      ],
      [t('centerManager.workShifts.table.type'), t(shiftTypeLabelKey(data.shiftType))],
      [
        t(`${k}.capacity`),
        `${t(`${k}.approvedOf`, { approved: data.approvedCount ?? 0, capacity: data.capacity })} · ${t(`${k}.pendingCount`, { count: data.pendingCount ?? 0 })}`
      ],
      [
        t(`${k}.deadline`),
        data.registrationDeadline ? format.dateTime(data.registrationDeadline) : t(`${k}.noDeadline`)
      ]
    ]
    const history = historyOf(data, registrations.data?.items ?? [], t as never)
    body = (
      <ModalColumns
        side={
          registrations.isPending ? (
            <Skeleton className='h-48 w-full rounded-xl' />
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
          )
        }
        sideClassName='lg:w-[26rem]'
      >
        <div className='space-y-5'>
          <div className='flex flex-wrap items-center gap-2'>
            <StatusBadge dot tone={SHIFT_STATUS_TONES[data.shiftStatus]}>
              {t(shiftStatusLabelKey(data.shiftStatus))}
            </StatusBadge>
          </div>
          <dl className='divide-y divide-outline-variant/30 rounded-xl border border-outline-variant/50'>
            {rows.map(([label, value]) => (
              <div className='flex justify-between gap-4 px-4 py-2.5 text-sm' key={label}>
                <dt className='text-on-surface-variant'>{label}</dt>
                <dd className='text-right font-medium tabular-nums'>{value}</dd>
              </div>
            ))}
            <div className='px-4 py-2.5 text-sm'>
              <dt className='text-on-surface-variant'>{t(`${k}.note`)}</dt>
              <dd className='mt-1 whitespace-pre-line'>{data.note || t(`${k}.noNote`)}</dd>
            </div>
            {data.cancellationReason ? (
              <div className='px-4 py-2.5 text-sm'>
                <dt className='text-on-surface-variant'>{t(`${k}.cancelReason`)}</dt>
                <dd className='mt-1'>{data.cancellationReason}</dd>
              </div>
            ) : null}
          </dl>
          <div className='flex flex-wrap gap-2'>
            {allowed.has('edit') ? (
              <Button
                leftIcon={<Icon name='edit' />}
                onClick={() => onAction('edit', data)}
                size='sm'
                variant='outline'
              >
                {t('centerManager.workShifts.actions.edit')}
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
                  allowed.has('open')
                    ? 'centerManager.workShifts.actions.open'
                    : 'centerManager.workShifts.actions.close'
                )}
              </Button>
            ) : null}
            {allowed.has('cancel') ? (
              <Button
                leftIcon={<Icon name='event_busy' />}
                onClick={() => onAction('cancel', data)}
                size='sm'
                variant='danger'
              >
                {t('centerManager.workShifts.actions.cancel')}
              </Button>
            ) : null}
          </div>
          {statusFailure && statusFailure.kind !== 'system' && statusFailure.kind !== 'field' ? (
            <FormAlert tone='warning'>{t(statusFailure.key)}</FormAlert>
          ) : null}
          <section aria-labelledby='shift-history-title'>
            <h3 className='text-base font-semibold' id='shift-history-title'>
              {t(`${k}.history`)}
            </h3>
            <ol className='mt-3 space-y-3 border-l border-outline-variant/60 pl-4'>
              {history.map((event, index) => (
                <li className='relative text-sm' key={`${event.at}-${index}`}>
                  <Icon
                    className='absolute -left-[1.6rem] top-0 rounded-full bg-surface-container-lowest text-base text-primary'
                    name={event.icon}
                  />
                  <p className='font-medium'>{event.label}</p>
                  <p className='text-xs text-on-surface-variant tabular-nums'>{format.dateTime(event.at)}</p>
                </li>
              ))}
            </ol>
            <p className='mt-3 text-xs text-outline'>{t(`${k}.historyHint`)}</p>
          </section>
        </div>
      </ModalColumns>
    )
  }

  return (
    <Modal onClose={onClose} open size='2xl' title={title}>
      {body}
    </Modal>
  )
}
