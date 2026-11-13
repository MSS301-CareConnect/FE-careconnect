import { useTranslation } from 'react-i18next'

import { shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderShiftRegistrationRecord, ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { Countdown } from '../../ui/countdown'

export type ShiftState = 'none' | 'expired' | ProviderShiftRegistrationRecord['registrationStatus']

const TONE: Record<ShiftState, StatusTone> = {
  none: 'neutral',
  expired: 'neutral',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'neutral'
}

/** The fields a card shows; a registration carries them for its shift, so no extra request per card. */
export type ShiftView = Pick<
  ProviderWorkShiftRecord,
  | 'workDate'
  | 'startTime'
  | 'endTime'
  | 'shiftType'
  | 'registrationDeadline'
  | 'note'
  | 'centerName'
  | 'cancellationReason'
> & { capacity?: number; approvedCount?: number }

/** One shift: date and hours first, then staffing, the sign-up deadline and the caregiver's own state on it. */
export function ShiftCard({
  shift,
  registration,
  state,
  now,
  onRegister,
  onCancel,
  onWithdraw,
  selected,
  onToggleSelect
}: {
  shift: ShiftView
  registration?: ProviderShiftRegistrationRecord
  state: ShiftState
  now: number
  onRegister?: () => void
  onCancel?: () => void
  onWithdraw?: () => void
  /** Set together with onToggleSelect to show a checkbox for quick multi sign-up. */
  selected?: boolean
  onToggleSelect?: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const capacity = shift.capacity ?? 0
  const approved = shift.approvedCount
  const full = approved !== undefined && capacity > 0 && approved >= capacity
  const progress = approved !== undefined && capacity > 0 ? Math.min(100, (approved / capacity) * 100) : null
  const deadlineOpen = shift.registrationDeadline ? new Date(shift.registrationDeadline).getTime() > now : true

  return (
    <article
      className={`${cgCard} relative flex h-full flex-col gap-3 p-4 sm:p-5 ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      {onToggleSelect ? (
        <label className='absolute top-2 right-2 grid h-11 w-11 cursor-pointer place-items-center'>
          <input
            aria-label={t('caregiver.work.shifts.select', {
              date: format.shortDay(shift.workDate),
              time: format.timeRangeWithDuration(shift.startTime, shift.endTime)
            })}
            checked={Boolean(selected)}
            className='h-5 w-5 cursor-pointer accent-primary disabled:cursor-not-allowed'
            disabled={full}
            onChange={onToggleSelect}
            type='checkbox'
          />
        </label>
      ) : null}
      <div className='flex flex-col-reverse items-start gap-2'>
        <div className='min-w-0'>
          <p className='text-lg font-bold text-on-surface tabular-nums'>{format.shortDay(shift.workDate)}</p>
          <p className='text-[15px] text-on-surface tabular-nums'>
            {format.timeRangeWithDuration(shift.startTime, shift.endTime)}
          </p>
          <p className='mt-0.5 text-sm text-on-surface-variant'>
            {[t(shiftTypeLabelKey(shift.shiftType)), shift.centerName].filter(Boolean).join(' · ')}
          </p>
        </div>
        <StatusBadge dot tone={TONE[state]}>
          {t(`caregiver.work.shifts.status.${state}`)}
        </StatusBadge>
      </div>

      {capacity > 0 ? (
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center justify-between gap-2 text-sm text-on-surface-variant'>
            <span className='flex items-center gap-1.5'>
              <Icon className='text-base text-primary' name='group' />
              {approved !== undefined
                ? t('caregiver.work.shifts.capacity', { approved, capacity })
                : t('caregiver.work.shifts.capacityOnly', { capacity })}
            </span>
            {full && state === 'none' ? (
              <StatusBadge tone='neutral'>{t('caregiver.work.shifts.full')}</StatusBadge>
            ) : null}
          </div>
          {progress !== null ? (
            <div aria-hidden='true' className='h-1.5 overflow-hidden rounded-full bg-surface-container-high'>
              <div
                className='h-full rounded-full bg-primary transition-[width] duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {shift.registrationDeadline && (state === 'none' || state === 'PENDING') ? (
        <div className='flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
          <span className='tabular-nums'>
            {t('caregiver.work.shifts.deadline', { time: format.shortDateTime(shift.registrationDeadline) })}
          </span>
          {deadlineOpen && state === 'none' ? <Countdown kind='closesIn' target={shift.registrationDeadline} /> : null}
        </div>
      ) : null}
      {shift.note ? <p className='text-sm text-on-surface-variant'>{shift.note}</p> : null}
      {registration?.caregiverNote ? (
        <p className='text-sm text-on-surface-variant'>
          {t('caregiver.work.shifts.yourNote', { note: registration.caregiverNote })}
        </p>
      ) : null}
      {shift.cancellationReason ? (
        <p className='text-sm text-error'>
          {t('caregiver.work.shifts.cancelledShift', { reason: shift.cancellationReason })}
        </p>
      ) : registration?.registrationStatus === 'REJECTED' && registration.rejectionReason ? (
        <p className='text-sm text-error'>
          {t('caregiver.work.shifts.rejectionReason', { reason: registration.rejectionReason })}
        </p>
      ) : null}

      {onRegister || onCancel || onWithdraw ? (
        <div className='mt-auto flex gap-2 pt-1'>
          {onRegister ? (
            <Button
              className='flex-1 sm:flex-none'
              disabled={full}
              leftIcon={<Icon className='text-lg' name='how_to_reg' />}
              onClick={onRegister}
            >
              {t('caregiver.work.shifts.register')}
            </Button>
          ) : null}
          {onCancel ? (
            <Button className='flex-1 text-error sm:flex-none' onClick={onCancel} variant='outline'>
              {t('caregiver.work.shifts.cancel')}
            </Button>
          ) : null}
          {onWithdraw ? (
            <Button className='flex-1 text-error sm:flex-none' onClick={onWithdraw} variant='outline'>
              {t('caregiver.work.shifts.withdraw')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
