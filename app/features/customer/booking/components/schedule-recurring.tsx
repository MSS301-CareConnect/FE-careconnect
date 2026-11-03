import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'
import { addMinutesToTime, minutesBetween, useFormat } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormField } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { TimeSelect } from '~/shared/ui/time-select'

import type { BookingForm } from '../hooks/use-booking-form'

const PREVIEW_COUNT = 6

/** The longest minimum duration among the chosen plans, used to suggest an end time; one hour otherwise. */
export function minimumVisitMinutes(form: BookingForm) {
  let minutes = 60
  for (const [offeringId, selection] of Object.entries(form.services)) {
    const plan = form.plansByOffering[offeringId]?.plans.find((item) => item.id === selection.pricePlanId)
    if (plan?.pricingUnit === 'HOUR' && plan.durationMinutes) minutes = Math.max(minutes, plan.durationMinutes)
  }
  return minutes
}

export function ScheduleRecurring({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [expanded, setExpanded] = useState(false)
  const { schedule, recurringIssues: issues, visitDays } = form
  const tooEarlyReason = t('customer.booking.schedule.tooEarlyDay', {
    duration: format.duration(form.noticeMinutes.RECURRING)
  })
  const minimum = minimumVisitMinutes(form)
  const length = minutesBetween(schedule.startTime, schedule.endTime)
  const shown = expanded ? visitDays : visitDays.slice(0, PREVIEW_COUNT)
  const dayNames = [...schedule.daysOfWeek]
    .sort()
    .map((day) => t(`booking.weekdays.${String(day) as (typeof WEEKDAYS)[number]}`))
    .join(', ')

  function changeStart(startTime: string) {
    const keep = minutesBetween(startTime, schedule.endTime) >= minimum
    form.updateSchedule({ startTime, endTime: keep ? schedule.endTime : addMinutesToTime(startTime, minimum) })
  }

  return (
    <div className='flex flex-col gap-5'>
      <SegmentedControl
        className='max-w-xs'
        legend={t('customer.booking.schedule.recurring.frequency')}
        onChange={(frequency) => form.updateSchedule({ frequency })}
        options={[
          { value: 'DAILY', label: t('booking.frequency.DAILY') },
          { value: 'WEEKLY', label: t('booking.frequency.WEEKLY') }
        ]}
        value={schedule.frequency}
      />

      <div className='cc-collapse' data-open={schedule.frequency === 'WEEKLY'}>
        <div>
          <fieldset aria-describedby={issues.noWeekday ? 'recurring-weekday-error' : undefined}>
            <legend className='text-sm font-semibold text-on-surface'>
              {t('customer.booking.schedule.recurring.weekdays')}
            </legend>
            <div className='mt-2 flex flex-wrap gap-2'>
              {WEEKDAYS.map((day) => {
                const value = Number(day)
                const checked = schedule.daysOfWeek.includes(value)
                return (
                  <label
                    className={`grid h-11 min-w-12 cursor-pointer place-items-center rounded-full border px-3 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${checked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-brand-300'}`}
                    key={day}
                  >
                    <input
                      checked={checked}
                      className='sr-only'
                      disabled={schedule.frequency !== 'WEEKLY'}
                      onChange={() =>
                        form.updateSchedule({
                          daysOfWeek: checked
                            ? schedule.daysOfWeek.filter((item) => item !== value)
                            : [...schedule.daysOfWeek, value]
                        })
                      }
                      type='checkbox'
                    />
                    {t(`booking.weekdays.${day}`)}
                  </label>
                )
              })}
            </div>
            {issues.noWeekday ? (
              <p className='mt-1.5 text-xs text-error' id='recurring-weekday-error'>
                {t('customer.booking.schedule.noWeekday')}
              </p>
            ) : null}
          </fieldset>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField
          error={issues.tooEarly ? tooEarlyReason : undefined}
          label={t('customer.booking.schedule.recurring.startDate')}
        >
          {(props) => (
            <DatePicker
              {...props}
              disabledReason={tooEarlyReason}
              min={form.earliestDay}
              onChange={(startDate) => form.updateSchedule({ startDate })}
              value={schedule.startDate}
            />
          )}
        </FormField>
        <FormField
          error={issues.invalidRange ? t('customer.booking.schedule.invalidRange') : undefined}
          label={t('customer.booking.schedule.recurring.endDate')}
        >
          {(props) => (
            <DatePicker
              {...props}
              disabledReason={t('customer.booking.schedule.invalidRange')}
              min={schedule.startDate || form.earliestDay}
              onChange={(endDate) => form.updateSchedule({ endDate })}
              value={schedule.endDate}
            />
          )}
        </FormField>
        <FormField label={t('customer.booking.schedule.recurring.startTime')}>
          {(props) => <TimeSelect {...props} onChange={changeStart} step={15} value={schedule.startTime} />}
        </FormField>
        <FormField
          error={issues.invalidTime ? t('customer.booking.schedule.invalidTime') : undefined}
          label={t('customer.booking.schedule.recurring.endTime')}
        >
          {(props) => (
            <TimeSelect
              {...props}
              onChange={(endTime) => form.updateSchedule({ endTime })}
              step={15}
              value={schedule.endTime}
            />
          )}
        </FormField>
      </div>

      <div className='rounded-xl border border-brand-100 bg-brand-50/60 p-4' aria-live='polite'>
        {visitDays.length === 0 || issues.invalidTime ? (
          <p className='flex items-start gap-2 text-sm text-on-surface-variant'>
            <Icon className='text-lg' name='event_busy' />
            {t('customer.booking.schedule.recurring.noVisits')}
          </p>
        ) : (
          <>
            <p className='flex items-start gap-2 text-sm font-medium text-on-surface'>
              <Icon className='text-lg text-primary' name='event_available' />
              {schedule.frequency === 'DAILY'
                ? t('customer.booking.schedule.recurring.previewDaily', {
                    count: visitDays.length,
                    from: format.shortDate(visitDays[0]),
                    to: format.date(visitDays.at(-1)),
                    duration: format.duration(length)
                  })
                : t('customer.booking.schedule.recurring.preview', {
                    count: visitDays.length,
                    days: dayNames,
                    from: format.shortDate(visitDays[0]),
                    to: format.date(visitDays.at(-1)),
                    duration: format.duration(length)
                  })}
            </p>
            <ul className='mt-3 flex flex-wrap gap-2'>
              {shown.map((day) => (
                <li
                  className='rounded-full bg-surface-container-lowest px-3 py-1 text-xs text-on-surface tabular-nums'
                  key={day}
                >
                  {format.shortDayLabel(day)} · {schedule.startTime}–{schedule.endTime}
                </li>
              ))}
            </ul>
            {visitDays.length > PREVIEW_COUNT ? (
              <button
                className='mt-2 text-sm font-medium text-primary hover:underline'
                onClick={() => setExpanded((value) => !value)}
                type='button'
              >
                {expanded
                  ? t('customer.booking.schedule.recurring.showLess')
                  : t('customer.booking.schedule.recurring.showAll', { count: visitDays.length })}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
