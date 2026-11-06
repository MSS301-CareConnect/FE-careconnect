import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { Combobox, type ComboboxOption } from '~/shared/ui/combobox'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'
import { TimeSelect } from '~/shared/ui/time-select'

import { createTimeOff, fetchTimeOffs, providerKeys, removeTimeOff } from './provider-api'

const k = 'centerManager.provider.timeOff' as const
const MAX_DAYS = 30

/** A Vietnam-time day + "HH:mm" as an ISO instant (time off is entered in the center's time zone). */
export function vnInstant(day: string, time: string) {
  return new Date(`${day}T${time}:00+07:00`).toISOString()
}

export type TimeOffPhase = 'ongoing' | 'upcoming' | 'past'

export function timeOffPhase(item: Pick<ProviderTimeOffRecord, 'startAt' | 'endAt'>, now: number): TimeOffPhase {
  if (new Date(item.endAt).getTime() <= now) return 'past'
  return new Date(item.startAt).getTime() <= now ? 'ongoing' : 'upcoming'
}

/** "08:00 · T6, 06/11 → 17:00 · T6, 06/11" collapsed to "T6, 06/11 · 08:00–17:00" when on one day. */
export function useTimeOffRange() {
  const format = useFormat()
  return (item: Pick<ProviderTimeOffRecord, 'startAt' | 'endAt'>) => {
    const startDay = calendarDayOf(item.startAt)
    const endDay = calendarDayOf(item.endAt)
    if (startDay === endDay) return format.visitRange(item.startAt, item.endAt)
    return `${format.clock(item.startAt)} · ${format.shortDayLabel(startDay)} → ${format.clock(item.endAt)} · ${format.shortDayLabel(endDay)}`
  }
}

export function TimeOffPhaseBadge({ phase }: { phase: TimeOffPhase }) {
  const { t } = useTranslation()
  const tone = phase === 'ongoing' ? 'warning' : phase === 'upcoming' ? 'info' : 'neutral'
  return (
    <StatusBadge dot tone={tone}>
      {t(`${k}.phase.${phase}`)}
    </StatusBadge>
  )
}

interface TimeOffDialogProps {
  open: boolean
  onClose: () => void
  /** Fixed caregiver (caregiver detail page); without it the dialog asks for one from `caregivers`. */
  caregiverId?: string
  caregiverName?: string
  caregivers?: readonly ComboboxOption[]
  /** First day shown in the date pickers. */
  defaultDay?: string
}

/**
 * M-12: the manager records a caregiver's time off. ProviderService rejects one that overlaps another time off (409);
 * a manager may cover booked visits (PRV-02 rule 3), so the dialog reminds them to reassign those visits.
 */
export function TimeOffDialog({
  open,
  onClose,
  caregiverId,
  caregiverName,
  caregivers,
  defaultDay
}: TimeOffDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [who, setWho] = useState(caregiverId ?? '')
  const [startDate, setStartDate] = useState(defaultDay ?? '')
  const [startTime, setStartTime] = useState('08:00')
  const [endDate, setEndDate] = useState(defaultDay ?? '')
  const [endTime, setEndTime] = useState('17:00')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const startAt = startDate ? new Date(vnInstant(startDate, startTime)).getTime() : Number.NaN
  const endAt = endDate ? new Date(vnInstant(endDate, endTime)).getTime() : Number.NaN
  const errors = {
    caregiver: !who ? t(`${k}.errors.caregiver`) : undefined,
    start: !startDate ? t(`${k}.errors.start`) : undefined,
    end: !endDate
      ? t(`${k}.errors.end`)
      : endAt <= startAt
        ? t(`${k}.errors.order`)
        : endAt - startAt > MAX_DAYS * 86_400_000
          ? t(`${k}.errors.tooLong`, { days: MAX_DAYS })
          : undefined,
    reason: reason.length > 500 ? t(`${k}.errors.reason`) : undefined
  }
  const valid = !Object.values(errors).some(Boolean)

  const add = useMutation({
    mutationFn: () =>
      createTimeOff(who, {
        startAt: vnInstant(startDate, startTime),
        endAt: vnInstant(endDate, endTime),
        reason: reason.trim() || undefined
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.allTimeOffs })
      toastSuccess(t(`${k}.added`))
      onClose()
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (valid) add.mutate()
  }
  const show = (message: string | undefined) => (submitted ? message : undefined)
  const failure = add.isError
    ? t(apiErrorStatus(add.error) === 409 ? `${k}.saveError` : apiRequestErrorKey(add.error, `${k}.actionError`))
    : undefined

  return (
    <Modal
      description={t(`${k}.dialogHint`)}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button onClick={onClose} variant='outline'>
            {t(`${k}.cancel`)}
          </Button>
          <Button form='time-off-form' leftIcon={<Icon name='event_busy' />} loading={add.isPending} type='submit'>
            {t(`${k}.add`)}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size='lg'
      title={caregiverName ? t(`${k}.dialogTitleFor`, { name: caregiverName }) : t(`${k}.dialogTitle`)}
    >
      <form className='grid gap-4 sm:grid-cols-2' id='time-off-form' noValidate onSubmit={submit}>
        {caregiverId ? null : (
          <FormField className='sm:col-span-2' error={show(errors.caregiver)} label={t(`${k}.caregiver`)}>
            {(control) => (
              <Combobox
                {...control}
                icon='person'
                onChange={setWho}
                options={caregivers ?? []}
                placeholder={t(`${k}.caregiverPlaceholder`)}
                searchPlaceholder={t(`${k}.caregiverSearch`)}
                value={who}
              />
            )}
          </FormField>
        )}
        <FormField error={show(errors.start)} label={t(`${k}.start`)}>
          {(control) => (
            <div className='flex gap-2'>
              <DatePicker {...control} className='min-w-0 flex-1' onChange={setStartDate} value={startDate} />
              <TimeSelect aria-label={t(`${k}.startTime`)} className='w-28' onChange={setStartTime} value={startTime} />
            </div>
          )}
        </FormField>
        <FormField error={show(errors.end)} label={t(`${k}.end`)}>
          {(control) => (
            <div className='flex gap-2'>
              <DatePicker
                {...control}
                className='min-w-0 flex-1'
                defaultMonth={startDate || undefined}
                min={startDate || undefined}
                onChange={setEndDate}
                value={endDate}
              />
              <TimeSelect aria-label={t(`${k}.endTime`)} className='w-28' onChange={setEndTime} value={endTime} />
            </div>
          )}
        </FormField>
        <FormField
          className='sm:col-span-2'
          error={show(errors.reason)}
          hint={t(`${k}.reasonHint`)}
          label={t(`${k}.reason`)}
        >
          {(control) => (
            <Textarea {...control} maxLength={500} onChange={(event) => setReason(event.target.value)} value={reason} />
          )}
        </FormField>
        <p className='flex items-start gap-2 rounded-xl bg-info-container/60 p-3 text-xs leading-5 text-on-info-container sm:col-span-2'>
          <Icon className='text-base' name='info' />
          {t(`${k}.visitsHint`)}
        </p>
        {failure ? (
          <FormAlert className='sm:col-span-2' tone='error'>
            {failure}
          </FormAlert>
        ) : null}
      </form>
    </Modal>
  )
}

/** Confirms and removes one time off; refreshes every time-off list. */
export function RemoveTimeOffDialog({ item, onClose }: { item: ProviderTimeOffRecord | null; onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const range = useTimeOffRange()
  const remove = useMutation({
    mutationFn: (target: ProviderTimeOffRecord) => removeTimeOff(target.caregiverId, target.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.allTimeOffs })
      toastSuccess(t(`${k}.removed`))
      onClose()
    }
  })
  return (
    <ConfirmDialog
      confirmLabel={t(`${k}.remove`)}
      description={
        item
          ? t(`${k}.removeDescription`, { name: item.caregiverName ?? t(`${k}.unknown`), range: range(item) })
          : undefined
      }
      error={remove.isError ? t(apiRequestErrorKey(remove.error, `${k}.actionError`)) : undefined}
      loading={remove.isPending}
      onClose={onClose}
      onConfirm={() => item && remove.mutate(item)}
      open={item !== null}
      title={t(`${k}.removeTitle`)}
      tone='danger'
    />
  )
}

/**
 * Caregiver detail: current and upcoming time off with an "add" popup. ProviderService keeps the availability search
 * (M-16) away from caregivers who are off.
 */
export function CaregiverTimeOffs({
  caregiverId,
  caregiverName,
  now
}: {
  caregiverId: string
  caregiverName: string
  now: number
}) {
  const { t } = useTranslation()
  const range = useTimeOffRange()
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<ProviderTimeOffRecord | null>(null)
  // Fixed when the panel opens: the list shows what is still running or ahead from that moment.
  const [from] = useState(() => new Date(now).toISOString())
  const timeOffs = useQuery({
    queryKey: [...providerKeys.timeOffs(caregiverId), from],
    queryFn: () => fetchTimeOffs(caregiverId, { from }),
    retry: false
  })
  const items = (timeOffs.data ?? []).map((item) => ({ ...item, caregiverName: item.caregiverName ?? caregiverName }))

  return (
    <section className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-lg font-bold'>
            <Icon className='text-primary' name='event_busy' />
            {t(`${k}.title`)}
          </h2>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${k}.panelHint`)}</p>
        </div>
        <Button leftIcon={<Icon name='add' />} onClick={() => setAdding(true)} size='sm' variant='outline'>
          {t(`${k}.add`)}
        </Button>
      </div>
      {timeOffs.isPending ? (
        <p className='mt-4 text-sm text-on-surface-variant' role='status'>
          {t(`${k}.loading`)}
        </p>
      ) : null}
      {timeOffs.isError ? (
        <p className='mt-4 text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(timeOffs.error, `${k}.error`))}
        </p>
      ) : null}
      {timeOffs.isSuccess && items.length === 0 ? (
        <p className='mt-4 rounded-xl bg-surface-container-low px-4 py-5 text-center text-sm text-on-surface-variant'>
          {t(`${k}.empty`)}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className='mt-4 space-y-2'>
          {items.map((item) => (
            <li
              className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/50 px-4 py-3'
              key={item.id}
            >
              <div className='min-w-0'>
                <p className='text-sm font-semibold tabular-nums'>{range(item)}</p>
                <p className='mt-0.5 text-xs text-on-surface-variant'>{item.reason || t(`${k}.noReason`)}</p>
              </div>
              <div className='flex items-center gap-2'>
                <TimeOffPhaseBadge phase={timeOffPhase(item, now)} />
                <Button
                  aria-label={t(`${k}.removeLabel`, { range: range(item) })}
                  onClick={() => setRemoving(item)}
                  size='sm'
                  variant='ghost'
                >
                  <Icon className='text-lg text-error' name='delete' />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {adding ? (
        <TimeOffDialog caregiverId={caregiverId} caregiverName={caregiverName} onClose={() => setAdding(false)} open />
      ) : null}
      <RemoveTimeOffDialog item={removing} onClose={() => setRemoving(null)} />
    </section>
  )
}
