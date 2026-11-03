import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { createTimeOff, providerKeys } from '~/entities/provider/provider-api'
import { apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { Drawer } from '~/shared/ui/drawer'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

import { ACTIVE_VISIT_STATUSES, VISIT_PAGE_SIZE, useVisitPage } from '../../data/caregiver-queries'
import { addDays } from '../../ui/caregiver-format'
import { useMySchedules } from '../calendar/use-calendar-data'

/** An instant from a Vietnam calendar day and time ("2026-11-08", "08:00"). */
function vnInstant(day: string, time: string) {
  return new Date(`${day}T${time}:00+07:00`)
}

const labelClass = 'mb-1 block text-sm font-medium text-on-surface'

/**
 * Add time off in a drawer: whole days or a time range, a reason, inline checks, and a warning when the period
 * overlaps assigned visits or open availability. The request is the same `{ startAt, endAt, reason }` as before.
 */
export function TimeOffForm({
  caregiverId,
  today,
  now,
  open,
  onClose
}: {
  caregiverId: string
  today: string
  now: number
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [allDay, setAllDay] = useState(true)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const start = startDate ? vnInstant(startDate, allDay ? '00:00' : startTime) : null
  const end = endDate ? (allDay ? vnInstant(addDays(endDate, 1), '00:00') : vnInstant(endDate, endTime)) : null
  const missing = !startDate || !endDate
  const order = !missing && start !== null && end !== null && end <= start
  const past = !missing && start !== null && start.getTime() < now - 60_000 && !(allDay && startDate === today)
  const valid = !missing && !order && !past

  const visits = useVisitPage(
    { from: startDate || today, to: endDate || today, page: 0, size: VISIT_PAGE_SIZE },
    open && valid
  )
  const schedules = useMySchedules()
  const overlapping = (from: number, to: number) =>
    start !== null && end !== null && from < end.getTime() && to > start.getTime()
  const visitConflicts = valid
    ? (visits.data?.items ?? []).filter(
        (visit) =>
          ACTIVE_VISIT_STATUSES.has(visit.status) &&
          overlapping(new Date(visit.startAt).getTime(), new Date(visit.endAt).getTime())
      ).length
    : 0
  const slotConflicts = valid
    ? (schedules.data ?? []).filter(
        (slot) =>
          slot.scheduleStatus === 'SCHEDULED' &&
          overlapping(
            vnInstant(slot.workDate, slot.startTime.slice(0, 5)).getTime(),
            vnInstant(slot.workDate, slot.endTime.slice(0, 5)).getTime()
          )
      ).length
    : 0

  const add = useMutation({
    mutationFn: () =>
      createTimeOff(caregiverId, {
        startAt: (start as Date).toISOString(),
        endAt: (end as Date).toISOString(),
        reason: reason.trim() || undefined
      }),
    onSuccess: async () => {
      toast.success(t('caregiver.work.timeOff.added'))
      reset()
      onClose()
      await queryClient.invalidateQueries({ queryKey: providerKeys.timeOffs(caregiverId) })
    }
  })

  function reset() {
    setAllDay(true)
    setStartDate(today)
    setEndDate(today)
    setStartTime('08:00')
    setEndTime('17:00')
    setReason('')
    setSubmitted(false)
    add.reset()
  }

  const dateError = submitted && missing ? t('caregiver.work.timeOff.form.required') : null
  const rangeError = order
    ? t('caregiver.work.timeOff.form.endBeforeStart')
    : past
      ? t('caregiver.work.timeOff.form.inPast')
      : null

  return (
    <Drawer
      description={t('caregiver.work.timeOff.form.description')}
      footer={
        <>
          <Button onClick={onClose} variant='outline'>
            {t('caregiver.ui.actions.cancel')}
          </Button>
          <Button
            disabled={visitConflicts > 0}
            loading={add.isPending}
            onClick={() => {
              setSubmitted(true)
              if (valid) add.mutate()
            }}
          >
            {t('caregiver.work.timeOff.form.save')}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title={t('caregiver.work.timeOff.form.title')}
    >
      <form
        className='flex flex-col gap-4'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (valid && visitConflicts === 0) add.mutate()
        }}
      >
        <label className='flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-outline-variant px-3'>
          <span className='text-[15px] font-medium text-on-surface'>{t('caregiver.work.timeOff.form.allDay')}</span>
          <input
            checked={allDay}
            className='peer sr-only'
            onChange={(event) => setAllDay(event.target.checked)}
            role='switch'
            type='checkbox'
          />
          <span
            aria-hidden='true'
            className='relative h-6 w-11 shrink-0 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5'
          />
        </label>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <label className={labelClass} htmlFor='time-off-start-date'>
              {t('caregiver.work.timeOff.form.startDate')}
            </label>
            <DatePicker
              aria-describedby={dateError ? 'time-off-date-error' : undefined}
              aria-invalid={Boolean(dateError && !startDate)}
              id='time-off-start-date'
              min={today}
              onChange={(value) => {
                setStartDate(value)
                if (value && endDate && endDate < value) setEndDate(value)
              }}
              value={startDate}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor='time-off-end-date'>
              {t('caregiver.work.timeOff.form.endDate')}
            </label>
            <DatePicker
              aria-describedby={rangeError ? 'time-off-range-error' : undefined}
              aria-invalid={Boolean(order)}
              defaultMonth={startDate || today}
              id='time-off-end-date'
              min={startDate || today}
              onChange={setEndDate}
              value={endDate}
            />
          </div>
          {!allDay ? (
            <>
              <div>
                <label className={labelClass} htmlFor='time-off-start-time'>
                  {t('caregiver.work.timeOff.form.startTime')}
                </label>
                <TimeSelect id='time-off-start-time' onChange={setStartTime} step={30} value={startTime} />
              </div>
              <div>
                <label className={labelClass} htmlFor='time-off-end-time'>
                  {t('caregiver.work.timeOff.form.endTime')}
                </label>
                <TimeSelect id='time-off-end-time' onChange={setEndTime} step={30} value={endTime} />
              </div>
            </>
          ) : null}
        </div>
        {dateError ? (
          <p className='-mt-2 text-sm text-error' id='time-off-date-error'>
            {dateError}
          </p>
        ) : null}
        {rangeError ? (
          <p className='-mt-2 text-sm text-error' id='time-off-range-error'>
            {rangeError}
          </p>
        ) : null}

        <div>
          <label className={labelClass} htmlFor='time-off-reason'>
            {t('caregiver.work.timeOff.form.reason')}
          </label>
          <input
            className='min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-[15px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
            id='time-off-reason'
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('caregiver.work.timeOff.form.reasonPlaceholder')}
            value={reason}
          />
        </div>

        {visitConflicts > 0 ? (
          <p
            className='flex items-start gap-2 rounded-lg bg-error-container p-3 text-sm text-on-error-container'
            role='alert'
          >
            <Icon className='text-lg' name='event_busy' />
            {t('caregiver.work.timeOff.form.conflictVisits', { count: visitConflicts })}
          </p>
        ) : null}
        {slotConflicts > 0 ? (
          <p className='flex items-start gap-2 rounded-lg bg-warning-container p-3 text-sm text-on-warning-container'>
            <Icon className='text-lg' name='info' />
            {t('caregiver.work.timeOff.form.conflictSlots', { count: slotConflicts })}
          </p>
        ) : null}
        {add.isError ? (
          <p className='rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {apiErrorStatus(add.error) === 409
              ? t('caregiver.provider.timeOff.saveError')
              : t(apiRequestErrorKey(add.error, 'caregiver.provider.timeOff.actionError'))}
          </p>
        ) : null}
        <button aria-hidden='true' className='sr-only' tabIndex={-1} type='submit'>
          {t('caregiver.work.timeOff.form.save')}
        </button>
      </form>
    </Drawer>
  )
}
