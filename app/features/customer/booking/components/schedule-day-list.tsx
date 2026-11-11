import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

import { MAX_CUSTOM_SLOTS, durationOutliers, groupDays, type CustomSlot } from '../hooks/schedule-slots'
import type { BookingForm, SlotIssue, SlotList } from '../hooks/use-booking-form'
import { ScheduleBulkBar } from './schedule-bulk-bar'
import { ScheduleDayCard } from './schedule-day-card'
import { minimumVisitMinutes } from './visit-duration'

/**
 * The visits of a RECURRING or CUSTOM booking, one card per day holding that day's services (2026-11-11), so two
 * services on one day read as one day. Days can be chosen to set a time or be removed together; visits that clash
 * with the chosen caregiver's other bookings are counted at the top and can be dropped in one go. "Remove all"
 * empties the list after a confirmation.
 */
export function ScheduleDayList({
  form,
  list,
  slots,
  issues,
  legend,
  hint,
  minDay,
  maxDay
}: {
  form: BookingForm
  list: SlotList
  slots: CustomSlot[]
  issues: (SlotIssue | null)[]
  legend: string
  hint?: string
  minDay: string
  maxDay?: string
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const days = groupDays(slots)
  const outliers = durationOutliers(slots)
  const withoutVisit = form.servicesWithoutVisit(slots)
  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set())
  const [clearing, setClearing] = useState(false)
  // Days can disappear (removed, moved): only days still in the list count.
  const chosenDays = days.filter((day) => chosen.has(day.date))
  const allChosen = days.length > 0 && chosenDays.length === days.length
  const chosenIndices = chosenDays.flatMap((day) => day.indices)
  const clashing = issues.flatMap((issue, index) => (issue === 'busy' || issue === 'buffer' ? [index] : []))
  const firstChosen = slots[chosenIndices[0]]

  function toggle(date: string) {
    setChosen((current) => {
      const next = new Set(current)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <fieldset aria-label={legend}>
      <div className='mb-1 flex items-center justify-between gap-2'>
        <legend className='text-sm font-semibold text-on-surface'>{legend}</legend>
        <span className='flex items-center gap-2'>
          <span className='rounded-full bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant tabular-nums'>
            {t('customer.booking.schedule.custom.counter', { count: slots.length, max: MAX_CUSTOM_SLOTS })}
          </span>
          {slots.length > 0 ? (
            <button
              className='inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-error hover:bg-error-container/50 focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setClearing(true)}
              type='button'
            >
              <Icon className='text-lg' name='delete_sweep' />
              {t('customer.booking.schedule.clearAll.action')}
            </button>
          ) : null}
        </span>
      </div>
      <ConfirmDialog
        confirmLabel={t('customer.booking.schedule.clearAll.confirm')}
        danger
        description={t('customer.booking.schedule.clearAll.description', {
          days: days.length,
          count: slots.length
        })}
        onClose={() => setClearing(false)}
        onConfirm={() => {
          form.removeSlots(
            slots.map((_, index) => index),
            list
          )
          setChosen(new Set())
          setClearing(false)
        }}
        open={clearing}
        title={t('customer.booking.schedule.clearAll.title')}
      />
      {hint ? <p className='mb-3 text-xs text-on-surface-variant'>{hint}</p> : <div className='mb-2' />}
      {form.multiService ? (
        <p className='mb-3 flex items-start gap-1.5 text-xs text-on-surface-variant'>
          <Icon className='text-sm' name='info' />
          {t('customer.booking.schedule.custom.multiHint')}
        </p>
      ) : null}
      {withoutVisit.length > 0 && slots.length > 0 ? (
        <p
          className='mb-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-container/60 p-3 text-sm text-on-warning-container'
          role='status'
        >
          <Icon className='text-lg' name='warning' />
          {t('customer.booking.schedule.custom.withoutVisit', {
            names: withoutVisit.map((option) => option.name).join(', ')
          })}
        </p>
      ) : null}
      {clashing.length > 0 ? (
        <div
          className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/40 p-3 text-sm text-on-surface'
          role='status'
        >
          <span className='flex items-start gap-2'>
            <Icon className='text-lg text-error' name='event_busy' />
            {t('customer.booking.schedule.busy.summary', {
              count: clashing.length,
              name: form.chosenCaregiver?.fullName ?? '',
              buffer: format.duration(form.busy.bufferMinutes)
            })}
          </span>
          <Button
            leftIcon={<Icon className='text-lg' name='delete_sweep' />}
            onClick={() => form.removeSlots(clashing, list)}
            size='sm'
            variant='outline'
          >
            {t('customer.booking.schedule.busy.removeAll', { count: clashing.length })}
          </Button>
        </div>
      ) : null}
      {days.length > 1 ? (
        <label className='mb-2 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium text-on-surface'>
          <input
            checked={allChosen}
            className='h-5 w-5 accent-[var(--color-primary)]'
            onChange={() => setChosen(allChosen ? new Set() : new Set(days.map((day) => day.date)))}
            type='checkbox'
          />
          {t('customer.booking.schedule.bulk.chooseAll')}
        </label>
      ) : null}
      {chosenDays.length > 0 && firstChosen ? (
        <ScheduleBulkBar
          count={chosenDays.length}
          initialEnd={firstChosen.endTime}
          initialStart={firstChosen.startTime}
          key={chosenDays.map((day) => day.date).join(',')}
          minimumMinutes={minimumVisitMinutes(form)}
          onApply={(startTime, endTime, careServiceId) =>
            form.updateSlots(
              chosenIndices.filter((index) => !careServiceId || slots[index].careServiceId === careServiceId),
              { startTime, endTime },
              list
            )
          }
          onClear={() => setChosen(new Set())}
          onRemove={() => {
            form.removeSlots(chosenIndices, list)
            setChosen(new Set())
          }}
          services={form.multiService ? form.serviceOptions : []}
          total={days.length}
        />
      ) : null}
      {days.length === 0 ? (
        <p className='rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.schedule.custom.empty')}
        </p>
      ) : null}
      <ol className='flex flex-col gap-3'>
        {days.map((day) => (
          <ScheduleDayCard
            chosen={chosen.has(day.date)}
            date={day.date}
            form={form}
            indices={day.indices}
            issues={issues}
            key={day.date || 'undated'}
            list={list}
            maxDay={maxDay}
            minDay={minDay}
            onToggle={() => toggle(day.date)}
            outliers={outliers}
            slots={slots}
          />
        ))}
      </ol>
      {slots.length < MAX_CUSTOM_SLOTS ? (
        <Button
          className='mt-3'
          leftIcon={<Icon className='text-lg' name='add' />}
          onClick={() => form.addDay(list)}
          variant='outline'
        >
          {t('customer.booking.schedule.custom.addDay')}
        </Button>
      ) : null}
    </fieldset>
  )
}
