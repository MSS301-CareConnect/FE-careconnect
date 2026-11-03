import { useTranslation } from 'react-i18next'

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
  APPROVED: 'info',
  REJECTED: 'error',
  CANCELLED: 'neutral'
}

/** One shift: date and hours first, then capacity, the sign-up deadline and the caregiver's own state on it. */
export function ShiftCard({
  shift,
  registration,
  state,
  now,
  onRegister,
  onCancel
}: {
  shift: ProviderWorkShiftRecord
  registration?: ProviderShiftRegistrationRecord
  state: ShiftState
  now: number
  onRegister?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const approved = shift.approvedCount ?? null
  const progress = approved !== null && shift.capacity > 0 ? Math.min(100, (approved / shift.capacity) * 100) : null
  const deadlineOpen = shift.registrationDeadline ? new Date(shift.registrationDeadline).getTime() > now : true

  return (
    <article className={`${cgCard} flex flex-col gap-3 p-4 sm:p-5`}>
      <div className='flex flex-col-reverse items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-3'>
        <div className='min-w-0'>
          <p className='text-lg font-bold text-on-surface tabular-nums'>{format.shortDay(shift.workDate)}</p>
          <p className='text-[15px] text-on-surface tabular-nums'>
            {format.timeRangeWithDuration(shift.startTime, shift.endTime)}
          </p>
          <p className='mt-0.5 text-sm text-on-surface-variant'>
            {[
              shift.centerName,
              shift.shiftType === 'DAILY' || shift.shiftType === 'WEEKLY'
                ? t(`caregiver.work.shifts.type.${shift.shiftType}`)
                : null
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <StatusBadge dot tone={TONE[state]}>
          {t(`caregiver.work.shifts.status.${state}`)}
        </StatusBadge>
      </div>

      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between text-sm text-on-surface-variant'>
          <span className='flex items-center gap-1.5'>
            <Icon className='text-base text-primary' name='group' />
            {approved !== null
              ? t('caregiver.work.shifts.capacity', { approved, capacity: shift.capacity })
              : t('caregiver.work.shifts.capacityOnly', { capacity: shift.capacity })}
          </span>
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

      {shift.registrationDeadline ? (
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
      {registration?.registrationStatus === 'REJECTED' && registration.rejectionReason ? (
        <p className='text-sm text-error'>
          {t('caregiver.work.shifts.rejectionReason', { reason: registration.rejectionReason })}
        </p>
      ) : null}

      {onRegister || onCancel ? (
        <div className='flex gap-2'>
          {onRegister ? (
            <Button
              className='flex-1 sm:flex-none'
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
        </div>
      ) : null}
    </article>
  )
}
