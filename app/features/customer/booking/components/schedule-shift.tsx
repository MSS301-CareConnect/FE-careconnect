import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { shortTime, vietnamInstant } from '~/entities/booking/booking-format'
import type { ProviderBookableScheduleRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import type { BookingForm } from '../hooks/use-booking-form'
import { useShiftSchedules } from '../hooks/use-shift-schedules'
import { ScheduleShiftSlots } from './schedule-shift-slots'

/**
 * SHIFT (spec §3 / §6, 2026-11-05): the caregiver's open shifts grouped by day. A shift that already holds its maximum
 * number of bookings, or ends before the advance notice, stays visible but locked; the chosen shift is then split into
 * time slots for the chosen services.
 */
export function ScheduleShift({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const caregiverId = form.selectedCaregiverId
  const shifts = useShiftSchedules(caregiverId, true)
  const { schedules, held } = shifts
  const [day, setDay] = useState('')
  const earliest = form.now + form.noticeMinutes.SHIFT * 60_000

  if (schedules.isPending || held.isPending)
    return (
      <SkeletonGroup className='flex flex-col gap-3' label={t('customer.booking.schedule.shift.loading')}>
        <div className='flex gap-2'>
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton className='h-14 w-20 rounded-xl' key={index} />
          ))}
        </div>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
          {[0, 1, 2].map((index) => (
            <Skeleton className='h-12 rounded-xl' key={index} />
          ))}
        </div>
      </SkeletonGroup>
    )
  if (schedules.isError || held.isError)
    return (
      <ErrorState
        message={t('customer.booking.schedule.shift.error')}
        onRetry={() => {
          void schedules.refetch()
          void held.refetch()
        }}
      />
    )
  if (schedules.data.length === 0)
    return (
      <EmptyState
        description={t('customer.booking.schedule.shift.empty')}
        icon='event_busy'
        title={t('customer.booking.schedule.shift.emptyTitle')}
      />
    )

  const startsAt = (schedule: ProviderBookableScheduleRecord) =>
    Date.parse(vietnamInstant(schedule.workDate, shortTime(schedule.startTime)))
  const endsAt = (schedule: ProviderBookableScheduleRecord) =>
    Date.parse(vietnamInstant(schedule.workDate, shortTime(schedule.endTime)))
  const locked = (schedule: ProviderBookableScheduleRecord) =>
    shifts.bookingsLeft(schedule) === 0 ? 'full' : endsAt(schedule) <= earliest ? 'tooSoon' : null
  const byDay = new Map<string, ProviderBookableScheduleRecord[]>()
  for (const schedule of [...schedules.data].sort((a, b) => startsAt(a) - startsAt(b))) {
    byDay.set(schedule.workDate, [...(byDay.get(schedule.workDate) ?? []), schedule])
  }
  const days = [...byDay.keys()]
  const chosen = schedules.data.find((item) => item.id === form.schedule.scheduleId)
  const activeDay =
    day && byDay.has(day)
      ? day
      : (chosen?.workDate ?? days.find((item) => byDay.get(item)!.some((schedule) => !locked(schedule))) ?? days[0])
  const name = form.chosenCaregiver?.fullName ?? ''

  return (
    <div className='flex flex-col gap-6'>
      <fieldset>
        <legend className='mb-3 text-sm font-semibold text-on-surface'>
          {t('customer.booking.schedule.shift.legend', { name })}
        </legend>
        <div
          aria-label={t('customer.booking.schedule.shift.dayLegend')}
          className='cc-no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1'
          role='group'
        >
          {days.map((item) => {
            const open = byDay.get(item)!.filter((schedule) => !locked(schedule)).length
            const active = item === activeDay
            return (
              <button
                aria-pressed={active}
                className={`flex min-h-14 min-w-20 shrink-0 snap-start flex-col items-center justify-center rounded-xl border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active ? 'border-primary bg-primary text-on-primary' : open ? 'border-outline-variant bg-surface-container-lowest hover:border-brand-300' : 'border-outline-variant bg-surface-container-low text-on-surface-variant'}`}
                key={item}
                onClick={() => setDay(item)}
                type='button'
              >
                <span className='font-semibold'>{format.weekday(item)}</span>
                <span className='tabular-nums'>{format.shortDate(item)}</span>
              </button>
            )
          })}
        </div>
        <div className='cc-fade-up mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3' key={activeDay}>
          {(byDay.get(activeDay) ?? []).map((schedule) => {
            const reason = locked(schedule)
            const checked = form.schedule.scheduleId === schedule.id
            const left = shifts.bookingsLeft(schedule)
            return (
              <label
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${reason ? 'cursor-not-allowed border-outline-variant bg-surface-container-low text-on-surface-variant' : checked ? 'cursor-pointer border-primary bg-brand-50 font-semibold text-primary shadow-[0_0_0_1px_var(--color-primary)]' : 'cursor-pointer border-outline-variant bg-surface-container-lowest hover:border-brand-300'}`}
                key={schedule.id}
              >
                <input
                  checked={checked}
                  className='sr-only'
                  disabled={Boolean(reason)}
                  name='caregiverSchedule'
                  onChange={() => form.chooseShift(schedule.id, schedule.workDate)}
                  type='radio'
                />
                <span className={`tabular-nums ${reason ? 'line-through' : ''}`}>{shifts.timeOf(schedule)}</span>
                <span className='text-xs'>
                  {reason
                    ? t(`customer.booking.schedule.shift.${reason}`)
                    : t('customer.booking.schedule.shift.bookingsLeft', { count: left })}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {chosen && !locked(chosen) ? (
        <ScheduleShiftSlots
          bufferMinutes={shifts.bufferMinutes}
          busy={shifts.busyRanges(chosen)}
          earliest={earliest}
          form={form}
          schedule={chosen}
        />
      ) : null}
    </div>
  )
}
