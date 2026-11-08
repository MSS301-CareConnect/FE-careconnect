import { useTranslation } from 'react-i18next'

import { WEEKDAYS } from '~/entities/booking/booking-format'
import { addMinutesToTime, minutesBetween } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormField } from '~/shared/ui/form-field'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { TimeSelect } from '~/shared/ui/time-select'

import type { RecurrenceRule, RuleIssues } from '../hooks/schedule-slots'

/**
 * Frequency, weekdays, date range and time range of a pattern — the RECURRING booking itself and the CUSTOM quick add
 * (CR-1). Errors show under the field they belong to.
 */
export function ScheduleRuleFields({
  rule,
  issues,
  earliestDay,
  minimumMinutes,
  tooEarlyReason,
  idPrefix,
  onChange
}: {
  rule: RecurrenceRule
  issues: RuleIssues
  earliestDay: string
  minimumMinutes: number
  tooEarlyReason: string
  idPrefix: string
  onChange: (patch: Partial<RecurrenceRule>) => void
}) {
  const { t } = useTranslation()
  const weekdayErrorId = `${idPrefix}-weekday-error`

  function changeStart(startTime: string) {
    const keep = minutesBetween(startTime, rule.endTime) >= minimumMinutes
    onChange({ startTime, endTime: keep ? rule.endTime : addMinutesToTime(startTime, minimumMinutes) })
  }

  return (
    <div className='flex flex-col gap-5'>
      <SegmentedControl
        className='max-w-xs'
        legend={t('customer.booking.schedule.recurring.frequency')}
        onChange={(frequency) => onChange({ frequency })}
        options={[
          { value: 'DAILY', label: t('booking.frequency.DAILY') },
          { value: 'WEEKLY', label: t('booking.frequency.WEEKLY') }
        ]}
        value={rule.frequency}
      />

      <div className='cc-collapse' data-open={rule.frequency === 'WEEKLY'}>
        <div>
          <fieldset aria-describedby={issues.noWeekday ? weekdayErrorId : undefined}>
            <legend className='text-sm font-semibold text-on-surface'>
              {t('customer.booking.schedule.recurring.weekdays')}
            </legend>
            <div className='mt-2 flex flex-wrap gap-2'>
              {WEEKDAYS.map((day) => {
                const value = Number(day)
                const checked = rule.daysOfWeek.includes(value)
                return (
                  <label
                    className={`grid h-11 min-w-12 cursor-pointer place-items-center rounded-full border px-3 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${checked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-brand-300'}`}
                    key={day}
                  >
                    <input
                      checked={checked}
                      className='sr-only'
                      disabled={rule.frequency !== 'WEEKLY'}
                      onChange={() =>
                        onChange({
                          daysOfWeek: checked
                            ? rule.daysOfWeek.filter((item) => item !== value)
                            : [...rule.daysOfWeek, value]
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
              <p className='mt-1.5 text-xs text-error' id={weekdayErrorId}>
                {t('customer.booking.schedule.noWeekday')}
              </p>
            ) : null}
          </fieldset>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField label={t('customer.booking.schedule.recurring.startDate')}>
          {(props) => (
            <DatePicker
              {...props}
              disabledReason={tooEarlyReason}
              min={earliestDay}
              onChange={(startDate) => onChange({ startDate })}
              value={rule.startDate}
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
              min={rule.startDate || earliestDay}
              onChange={(endDate) => onChange({ endDate })}
              value={rule.endDate}
            />
          )}
        </FormField>
        <FormField label={t('customer.booking.schedule.recurring.startTime')}>
          {(props) => <TimeSelect {...props} onChange={changeStart} step={15} value={rule.startTime} />}
        </FormField>
        <FormField
          error={issues.invalidTime ? t('customer.booking.schedule.invalidTime') : undefined}
          label={t('customer.booking.schedule.recurring.endTime')}
        >
          {(props) => (
            <TimeSelect {...props} onChange={(endTime) => onChange({ endTime })} step={15} value={rule.endTime} />
          )}
        </FormField>
      </div>
    </div>
  )
}
