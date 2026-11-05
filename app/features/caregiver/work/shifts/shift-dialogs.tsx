import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { fetchTimeOffs, providerKeys } from '~/entities/provider/provider-api'
import { shiftInstant, shiftTypeLabelKey, timeRangesOverlap } from '~/entities/provider/work-shift'
import { apiErrorCode } from '~/shared/api/error-details'
import type { ProviderShiftRegistrationRecord, ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'

import { hhmm, useCaregiverFormat } from '../../ui/caregiver-format'

const k = 'caregiver.work.shifts' as const
const KNOWN_ERRORS = [4401, 4355, 4305, 4304, 4354, 4308, 4351, 4415] as const

/** The sentence for a ProviderService refusal of a sign-up / withdrawal. */
export function shiftErrorKey(error: unknown) {
  const code = apiErrorCode(error)
  return (KNOWN_ERRORS as readonly number[]).includes(code ?? 0)
    ? (`${k}.errors.e${code as (typeof KNOWN_ERRORS)[number]}` as const)
    : (`${k}.errors.fallback` as const)
}

/**
 * Confirm a sign-up with the shift summary, an optional note and warnings the backend would otherwise refuse:
 * an overlapping sign-up of the same day and time off covering the shift.
 */
export function RegisterShiftDialog({
  shift,
  caregiverId,
  myRegistrations,
  pending,
  error,
  onConfirm,
  onClose
}: {
  shift: ProviderWorkShiftRecord
  caregiverId?: string
  myRegistrations: ProviderShiftRegistrationRecord[]
  pending: boolean
  error: unknown
  onConfirm: (note: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const [note, setNote] = useState('')
  const start = new Date(shiftInstant(shift.workDate, shift.startTime)).toISOString()
  const end = new Date(shiftInstant(shift.workDate, shift.endTime)).toISOString()
  const timeOffs = useQuery({
    queryKey: [...providerKeys.timeOffs(caregiverId ?? ''), start, end],
    queryFn: () => fetchTimeOffs(caregiverId!, { from: start, to: end }),
    enabled: Boolean(caregiverId),
    retry: false
  })
  const overlap = myRegistrations.find(
    (item) =>
      item.workShiftId !== shift.id &&
      (item.registrationStatus === 'PENDING' || item.registrationStatus === 'APPROVED') &&
      item.workDate === shift.workDate &&
      item.startTime &&
      item.endTime &&
      timeRangesOverlap({ start: item.startTime, end: item.endTime }, { start: shift.startTime, end: shift.endTime })
  )
  const inTimeOff = (timeOffs.data ?? []).length > 0

  return (
    <Modal
      description={t(`${k}.registerDescription`, {
        date: format.shortDay(shift.workDate),
        start: hhmm(shift.startTime),
        end: hhmm(shift.endTime)
      })}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button disabled={pending} onClick={onClose} variant='ghost'>
            {t('caregiver.ui.actions.cancel')}
          </Button>
          <Button disabled={inTimeOff} loading={pending} onClick={() => onConfirm(note.trim())}>
            {t(`${k}.register`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='md'
      title={t(`${k}.registerTitle`)}
    >
      <div className='space-y-4'>
        <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-surface-container-low p-3 text-sm'>
          <dt className='text-on-surface-variant'>{t('centerManager.workShifts.form.summary.time')}</dt>
          <dd className='font-medium tabular-nums'>{format.timeRangeWithDuration(shift.startTime, shift.endTime)}</dd>
          <dt className='text-on-surface-variant'>{t('centerManager.workShifts.form.summary.type')}</dt>
          <dd className='font-medium'>{t(shiftTypeLabelKey(shift.shiftType))}</dd>
          {shift.note ? (
            <>
              <dt className='text-on-surface-variant'>{t('centerManager.workShifts.detail.note')}</dt>
              <dd>{shift.note}</dd>
            </>
          ) : null}
        </dl>
        {overlap ? (
          <FormAlert tone='warning'>
            {t(`${k}.warnings.overlap`, { time: `${hhmm(overlap.startTime!)}–${hhmm(overlap.endTime!)}` })}
          </FormAlert>
        ) : null}
        {inTimeOff ? <FormAlert tone='warning'>{t(`${k}.warnings.timeOff`)}</FormAlert> : null}
        <FormField label={t(`${k}.note`)}>
          {(control) => (
            <Textarea
              {...control}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t(`${k}.notePlaceholder`)}
              rows={3}
              value={note}
            />
          )}
        </FormField>
        {error ? <FormAlert tone='warning'>{t(shiftErrorKey(error))}</FormAlert> : null}
      </div>
    </Modal>
  )
}

/** Withdraw from an approved shift (its availability slot is cancelled) — a reason is required. */
export function WithdrawShiftDialog({
  registration,
  pending,
  error,
  onConfirm,
  onClose
}: {
  registration: ProviderShiftRegistrationRecord
  pending: boolean
  error: unknown
  onConfirm: (reason: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const [reason, setReason] = useState('')
  const [invalid, setInvalid] = useState(false)

  return (
    <Modal
      description={t(`${k}.withdrawDescription`, {
        date: registration.workDate ? format.shortDay(registration.workDate) : '',
        start: hhmm(registration.startTime ?? ''),
        end: hhmm(registration.endTime ?? '')
      })}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button disabled={pending} onClick={onClose} variant='ghost'>
            {t('caregiver.ui.actions.cancel')}
          </Button>
          <Button
            loading={pending}
            onClick={() => {
              const value = reason.trim()
              if (!value || value.length > 500) {
                setInvalid(true)
                return
              }
              onConfirm(value)
            }}
            variant='danger'
          >
            {t(`${k}.withdraw`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='md'
      title={t(`${k}.withdrawTitle`)}
    >
      <div className='space-y-4'>
        <FormField error={invalid ? t(`${k}.withdrawReasonRequired`) : undefined} label={t(`${k}.withdrawReason`)}>
          {(control) => (
            <Textarea
              {...control}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value)
                setInvalid(false)
              }}
              placeholder={t(`${k}.withdrawReasonPlaceholder`)}
              rows={3}
              value={reason}
            />
          )}
        </FormField>
        {error ? <FormAlert tone='warning'>{t(shiftErrorKey(error))}</FormAlert> : null}
      </div>
    </Modal>
  )
}
