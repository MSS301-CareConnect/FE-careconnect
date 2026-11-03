import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addMinutesToTime, minutesBetween, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

import { MAX_CUSTOM_SLOTS, durationOutliers, type CustomSlot } from '../hooks/schedule-slots'
import type { BookingForm, SlotIssue, SlotList } from '../hooks/use-booking-form'
import { ScheduleBulkBar } from './schedule-bulk-bar'
import { minimumVisitMinutes } from './visit-duration'

const iconButton =
  'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

/**
 * One editable row per visit (date, start, end, duplicate, remove) — the CUSTOM visits and the visits of a RECURRING
 * pattern (CR-1). Errors (overlap, too soon, outside the pattern) show on the row that has them. Visits can be chosen
 * and edited together (one time range, or removed), and a visit whose length differs from the others is pointed out.
 */
export function ScheduleSlotList({
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
  const minimum = minimumVisitMinutes(form)
  const noticeType = list === 'recurringSlots' ? 'RECURRING' : 'CUSTOM'
  const tooEarlyReason = t('customer.booking.schedule.tooEarlyDay', {
    duration: format.duration(form.noticeMinutes[noticeType])
  })
  const messages: Record<SlotIssue, string | null> = {
    tooEarly: tooEarlyReason,
    invalidTime: t('customer.booking.schedule.invalidTime'),
    overlap: t('customer.booking.schedule.custom.overlap'),
    missingDate: t('customer.booking.schedule.custom.missingDate'),
    outsideRange: t('customer.booking.schedule.recurring.outsideRange')
  }
  const [chosen, setChosen] = useState<ReadonlySet<number>>(() => new Set())
  // Rows can disappear (removed, rebuilt from the pattern): only indices still in the list count.
  const selected = [...chosen].filter((index) => index < slots.length).sort((a, b) => a - b)
  const allChosen = slots.length > 0 && selected.length === slots.length
  const { usualMinutes, outliers } = durationOutliers(slots)
  const firstChosen = slots[selected[0]]

  function toggle(index: number) {
    setChosen((current) => {
      const next = new Set([...current].filter((item) => item < slots.length))
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <fieldset aria-label={legend}>
      <div className='mb-1 flex items-center justify-between gap-2'>
        <legend className='text-sm font-semibold text-on-surface'>{legend}</legend>
        <span className='rounded-full bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant tabular-nums'>
          {t('customer.booking.schedule.custom.counter', { count: slots.length, max: MAX_CUSTOM_SLOTS })}
        </span>
      </div>
      {hint ? <p className='mb-3 text-xs text-on-surface-variant'>{hint}</p> : <div className='mb-2' />}
      {slots.length > 1 ? (
        <label className='mb-2 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium text-on-surface'>
          <input
            checked={allChosen}
            className='h-5 w-5 accent-[var(--color-primary)]'
            onChange={() => setChosen(allChosen ? new Set() : new Set(slots.map((_, index) => index)))}
            type='checkbox'
          />
          {t('customer.booking.schedule.bulk.chooseAll')}
        </label>
      ) : null}
      {usualMinutes !== null && outliers.size > 0 ? (
        <p
          className='mb-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-container/60 p-3 text-sm text-on-warning-container'
          role='status'
        >
          <Icon className='text-lg' name='warning' />
          {t('customer.booking.schedule.duration.mismatch', {
            count: outliers.size,
            usual: format.duration(usualMinutes)
          })}
        </p>
      ) : null}
      {selected.length > 0 && firstChosen ? (
        <ScheduleBulkBar
          count={selected.length}
          initialEnd={firstChosen.endTime}
          initialStart={firstChosen.startTime}
          key={selected.join(',')}
          minimumMinutes={minimum}
          onApply={(startTime, endTime) => form.updateSlots(selected, { startTime, endTime }, list)}
          onClear={() => setChosen(new Set())}
          onRemove={() => {
            form.removeSlots(selected, list)
            setChosen(new Set())
          }}
          total={slots.length}
        />
      ) : null}
      {slots.length === 0 ? (
        <p className='rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.schedule.custom.empty')}
        </p>
      ) : null}
      <ol className='flex flex-col gap-3'>
        {slots.map((slot, index) => {
          const issue = issues[index]
          const errorId = `${list}-${index}-error`
          const number = index + 1
          const message = issue ? messages[issue] : null
          const dateInvalid = issue === 'tooEarly' || issue === 'overlap' || issue === 'outsideRange'
          const length = minutesBetween(slot.startTime, slot.endTime)
          const odd = !issue && outliers.has(index) && usualMinutes !== null
          const isChosen = selected.includes(index)
          return (
            <li
              className={`cc-fade-up rounded-xl border p-3 sm:p-4 ${issue && issue !== 'missingDate' ? 'border-error/40 bg-error-container/30' : odd ? 'border-warning/50 bg-warning-container/20' : isChosen ? 'border-primary/50 bg-brand-50/50' : 'border-outline-variant bg-surface-container-lowest'}`}
              key={index}
            >
              <div className='flex flex-wrap items-end gap-3'>
                <label className='flex w-full cursor-pointer items-center gap-2 text-xs font-semibold text-on-surface-variant sm:w-auto sm:self-center'>
                  <input
                    aria-label={t('customer.booking.schedule.bulk.choose', { number })}
                    checked={isChosen}
                    className='h-5 w-5 accent-[var(--color-primary)]'
                    onChange={() => toggle(index)}
                    type='checkbox'
                  />
                  {t('customer.booking.schedule.custom.visit', { number })}
                </label>
                <label className='min-w-40 flex-1 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.date')}
                  <DatePicker
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={dateInvalid || undefined}
                    className='mt-1'
                    disabledReason={tooEarlyReason}
                    max={maxDay}
                    min={minDay}
                    onChange={(date) => form.updateSlot(index, { date }, list)}
                    value={slot.date}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.start')}
                  <TimeSelect
                    className='mt-1'
                    onChange={(startTime) =>
                      form.updateSlot(
                        index,
                        {
                          startTime,
                          endTime:
                            minutesBetween(startTime, slot.endTime) >= minimum
                              ? slot.endTime
                              : addMinutesToTime(startTime, minimum)
                        },
                        list
                      )
                    }
                    value={slot.startTime}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.end')}
                  <TimeSelect
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={issue === 'invalidTime' || undefined}
                    className='mt-1'
                    onChange={(endTime) => form.updateSlot(index, { endTime }, list)}
                    value={slot.endTime}
                  />
                </label>
                <span
                  className={`min-w-16 pb-3 text-sm tabular-nums ${odd ? 'font-semibold text-on-warning-container' : 'text-on-surface-variant'}`}
                >
                  {format.duration(length)}
                </span>
                <span className='ml-auto flex gap-1'>
                  <button
                    aria-label={t('customer.booking.schedule.custom.duplicate', { number })}
                    className={iconButton}
                    disabled={slots.length >= MAX_CUSTOM_SLOTS}
                    onClick={() => form.duplicateSlot(index, list)}
                    title={t('customer.booking.schedule.custom.duplicate', { number })}
                    type='button'
                  >
                    <Icon name='content_copy' />
                  </button>
                  {slots.length > 1 ? (
                    <button
                      aria-label={t('customer.booking.schedule.custom.remove', { number })}
                      className={`${iconButton} hover:text-error`}
                      onClick={() => form.removeSlot(index, list)}
                      title={t('customer.booking.schedule.custom.remove', { number })}
                      type='button'
                    >
                      <Icon name='delete' />
                    </button>
                  ) : null}
                </span>
              </div>
              {odd && usualMinutes !== null ? (
                <p className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-warning-container'>
                  <span className='flex items-center gap-1.5'>
                    <Icon className='text-base' name='warning' />
                    {t('customer.booking.schedule.duration.rowDiffers', {
                      duration: format.duration(length),
                      usual: format.duration(usualMinutes)
                    })}
                  </span>
                  <button
                    className='font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                    onClick={() =>
                      form.updateSlot(index, { endTime: addMinutesToTime(slot.startTime, usualMinutes) }, list)
                    }
                    type='button'
                  >
                    {t('customer.booking.schedule.duration.fix', { usual: format.duration(usualMinutes) })}
                  </button>
                </p>
              ) : null}
              {message ? (
                <p className='mt-2 flex items-center gap-1.5 text-sm text-error' id={errorId}>
                  <Icon className='text-base' name='error' />
                  {message}
                </p>
              ) : null}
            </li>
          )
        })}
      </ol>
      {slots.length < MAX_CUSTOM_SLOTS ? (
        <Button
          className='mt-3'
          leftIcon={<Icon className='text-lg' name='add' />}
          onClick={() => form.addSlot(list)}
          variant='outline'
        >
          {t('customer.booking.schedule.custom.add')}
        </Button>
      ) : null}
    </fieldset>
  )
}
