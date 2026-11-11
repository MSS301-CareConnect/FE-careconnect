import { useTranslation } from 'react-i18next'

import { addMinutesToTime, minutesBetween, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

import type { ServiceTime } from '../hooks/schedule-slots'
import { isFixedPlan, planEndTime, type ServiceOption, type ServiceTimeIssue } from '../hooks/service-slots'

/**
 * The time of each chosen service in a pattern (2026-11-11), the way a SHIFT booking picks a time per service: one row
 * per service with its own start and end; a day does at least one of them, not necessarily all. A DAY / SHIFT plan fixes
 * the length, an HOUR plan its minimum; errors show under the row.
 */
export function ScheduleServiceTimes({
  options,
  times,
  issues,
  noneChosen,
  notes,
  idPrefix,
  onChange
}: {
  options: ServiceOption[]
  times: ServiceTime[]
  issues: (ServiceTimeIssue | null)[]
  noneChosen: boolean
  /** Per row: the days its visit would be too soon or clash with the caregiver (blocks the pattern). */
  notes: string[][]
  idPrefix: string
  onChange: (careServiceId: string, patch: Partial<ServiceTime>) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const multi = options.length > 1
  const noneId = `${idPrefix}-services-error`

  return (
    <fieldset aria-describedby={noneChosen ? noneId : undefined}>
      <legend className='text-sm font-semibold text-on-surface'>
        {t('customer.booking.schedule.pattern.timesLegend')}
      </legend>
      <p className='mt-0.5 text-xs text-on-surface-variant'>
        {multi
          ? t('customer.booking.schedule.pattern.timesHintMulti')
          : t('customer.booking.schedule.pattern.timesHint')}
      </p>
      <ul className='mt-2 flex flex-col gap-2'>
        {times.map((time, index) => {
          const option = options.find((item) => item.careServiceId === time.careServiceId)
          if (!option) return null
          const issue = issues[index]
          const errorId = `${idPrefix}-time-${index}-error`
          const plan = option.plan
          const fixed = isFixedPlan(plan)
          const length = minutesBetween(time.startTime, time.endTime)
          const snags = time.enabled ? (notes[index] ?? []) : []
          const notesId = `${idPrefix}-time-${index}-notes`
          const message =
            issue === 'invalidTime'
              ? t('customer.booking.schedule.invalidTime')
              : issue === 'overlap'
                ? t('customer.booking.schedule.pattern.overlap')
                : issue === 'planLength' && plan?.durationMinutes
                  ? t(
                      fixed
                        ? 'customer.booking.schedule.custom.planFixed'
                        : 'customer.booking.schedule.custom.planMinimum',
                      { plan: plan.planName, duration: format.duration(plan.durationMinutes) }
                    )
                  : null
          return (
            <li
              className={`rounded-xl border p-3 ${message || snags.length > 0 ? 'border-error/40 bg-error-container/30' : time.enabled ? 'border-primary/40 bg-brand-50/40' : 'border-outline-variant bg-surface-container-lowest'}`}
              key={time.careServiceId}
            >
              <div className='flex flex-wrap items-end gap-3'>
                <span className='min-w-44 flex-1 self-center'>
                  {multi ? (
                    <label className='flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface'>
                      <input
                        checked={time.enabled}
                        className='h-5 w-5 accent-[var(--color-primary)]'
                        onChange={() => onChange(time.careServiceId, { enabled: !time.enabled })}
                        type='checkbox'
                      />
                      {option.name}
                    </label>
                  ) : (
                    <span className='block text-sm font-semibold text-on-surface'>{option.name}</span>
                  )}
                  {plan?.durationMinutes ? (
                    <span className='mt-0.5 block text-xs text-on-surface-variant'>
                      {t(
                        fixed
                          ? 'customer.booking.schedule.pattern.planFixed'
                          : 'customer.booking.schedule.pattern.planMinimum',
                        { plan: plan.planName, duration: format.duration(plan.durationMinutes) }
                      )}
                    </span>
                  ) : null}
                </span>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.start')}
                  <TimeSelect
                    aria-describedby={snags.length > 0 ? notesId : undefined}
                    aria-invalid={snags.length > 0 || undefined}
                    className='mt-1'
                    disabled={!time.enabled}
                    onChange={(startTime) =>
                      onChange(time.careServiceId, {
                        startTime,
                        // Keeps the visit length while the start moves.
                        endTime: addMinutesToTime(startTime, length > 0 ? length : (plan?.durationMinutes ?? 60))
                      })
                    }
                    step={15}
                    value={time.startTime}
                  />
                </label>
                <label className='w-28 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.schedule.custom.end')}
                  <TimeSelect
                    aria-describedby={message ? errorId : undefined}
                    aria-invalid={Boolean(message) || undefined}
                    className='mt-1'
                    disabled={!time.enabled}
                    onChange={(endTime) => onChange(time.careServiceId, { endTime })}
                    step={15}
                    value={time.endTime}
                  />
                </label>
                <span className='min-w-16 pb-3 text-sm text-on-surface-variant tabular-nums'>
                  {length > 0 ? format.duration(length) : null}
                </span>
              </div>
              {snags.length > 0 ? (
                <ul className='mt-2 flex flex-col gap-1 text-sm text-error' id={notesId}>
                  {snags.map((note) => (
                    <li className='flex items-start gap-1.5' key={note}>
                      <Icon className='text-base' name='event_busy' />
                      {note}
                    </li>
                  ))}
                </ul>
              ) : null}
              {message && time.enabled ? (
                <p className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-error' id={errorId}>
                  <span className='flex items-center gap-1.5'>
                    <Icon className='text-base' name='error' />
                    {message}
                  </span>
                  {issue === 'planLength' && fixed ? (
                    <button
                      className='font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => onChange(time.careServiceId, { endTime: planEndTime(plan, time.startTime) })}
                      type='button'
                    >
                      {t('customer.booking.schedule.custom.planFix', { time: planEndTime(plan, time.startTime) })}
                    </button>
                  ) : null}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
      {noneChosen ? (
        <p className='mt-1.5 text-xs text-error' id={noneId}>
          {t('customer.booking.schedule.pattern.noService')}
        </p>
      ) : null}
    </fieldset>
  )
}
