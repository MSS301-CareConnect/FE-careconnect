import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SHIFT_TYPE_CODES, SHIFT_TYPE_PRESETS, shiftTypeLabelKey } from '~/entities/provider/work-shift'
import { addDays, minutesBetween, useFormat } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { NumberStepper } from '~/shared/ui/number-stepper'
import { TimeSelect } from '~/shared/ui/time-select'

import {
  MAX_BOOKINGS,
  MAX_CAPACITY,
  MAX_NOTE,
  repeatDates,
  type DeadlineMode,
  type ShiftErrorKey,
  type ShiftField,
  type ShiftFormValues
} from '../shift-form-model'

const k = 'centerManager.workShifts.form' as const
const chip =
  'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
const chipOn = 'border-primary bg-primary text-on-primary'
const chipOff =
  'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300 hover:bg-brand-50'

export function ShiftFormFields({
  values,
  errors,
  today,
  allowRepeat,
  scheduleLocked,
  deadlineText,
  activeCaregivers,
  summary,
  onChange
}: {
  values: ShiftFormValues
  errors: Partial<Record<ShiftField, ShiftErrorKey>>
  today: string
  allowRepeat: boolean
  scheduleLocked: boolean
  deadlineText: string
  activeCaregivers?: number
  summary?: ReactNode
  onChange: (patch: Partial<ShiftFormValues>, field?: ShiftField) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const error = (field: ShiftField) => (errors[field] ? t(`${k}.errors.${errors[field]}`) : undefined)
  const minutes = values.startTime && values.endTime ? minutesBetween(values.startTime, values.endTime) : 0
  const legacyType = values.shiftType && !(SHIFT_TYPE_CODES as readonly string[]).includes(values.shiftType)
  const days = allowRepeat && values.repeat ? repeatDates(values) : []
  const quickDates = [
    ['today', today],
    ['tomorrow', addDays(today, 1)],
    ['nextWeek', addDays(today, 7)]
  ] as const

  return (
    <div className='grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-5'>
      {/* Left column: Schedule & Registration */}
      <div className='space-y-4 lg:col-span-7'>
        <section className='space-y-3.5 rounded-xl bg-surface-container-low/45 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
              <Icon className='text-base text-primary' name='schedule' />
              {t(`${k}.groups.time`)}
            </h3>
            {minutes > 0 ? (
              <span className='inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums'>
                {t(`${k}.duration`, { value: format.duration(minutes) })}
              </span>
            ) : null}
          </div>

          <FormField error={error('workDate')} label={t(`${k}.date`)}>
            {(control) => (
              <div className='flex flex-wrap items-center gap-2'>
                <DatePicker
                  {...control}
                  className='w-full sm:w-44'
                  disabled={scheduleLocked}
                  min={today}
                  onChange={(workDate) => onChange({ workDate }, 'workDate')}
                  value={values.workDate}
                />
                <div className='flex flex-wrap gap-1.5'>
                  {quickDates.map(([name, day]) => (
                    <button
                      aria-pressed={values.workDate === day}
                      className={`${chip} ${values.workDate === day ? chipOn : chipOff}`}
                      disabled={scheduleLocked}
                      key={name}
                      onClick={() => onChange({ workDate: day }, 'workDate')}
                      type='button'
                    >
                      {t(`${k}.quickDates.${name}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FormField>

          <div className='space-y-1.5'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <p className='text-sm font-semibold text-on-surface' id='shift-type-label'>
                {t(`${k}.type`)}
              </p>
              <p className='text-xs text-on-surface-variant'>{t(`${k}.typeHint`)}</p>
            </div>
            <div aria-labelledby='shift-type-label' className='flex flex-wrap gap-1.5' role='group'>
              {SHIFT_TYPE_CODES.map((code) => (
                <button
                  aria-pressed={values.shiftType === code}
                  className={`${chip} ${values.shiftType === code ? chipOn : chipOff}`}
                  key={code}
                  onClick={() => {
                    const preset = code === 'CUSTOM' || scheduleLocked ? undefined : SHIFT_TYPE_PRESETS[code]
                    onChange(
                      preset ? { shiftType: code, startTime: preset.start, endTime: preset.end } : { shiftType: code },
                      'shiftType'
                    )
                  }}
                  type='button'
                >
                  {t(shiftTypeLabelKey(code))}
                </button>
              ))}
              {legacyType ? (
                <span className={`${chip} border-dashed border-outline text-on-surface-variant`}>
                  {t(`${k}.legacyType`, { label: t(shiftTypeLabelKey(values.shiftType)) })}
                </span>
              ) : null}
            </div>
            {errors.shiftType ? (
              <p className='text-xs font-medium text-error' role='alert'>
                {error('shiftType')}
              </p>
            ) : null}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <FormField error={error('startTime')} label={t(`${k}.start`)}>
              {(control) => (
                <TimeSelect
                  {...control}
                  disabled={scheduleLocked}
                  onChange={(startTime) => onChange({ startTime }, 'startTime')}
                  step={30}
                  value={values.startTime}
                />
              )}
            </FormField>
            <FormField error={error('endTime')} label={t(`${k}.end`)}>
              {(control) => (
                <TimeSelect
                  {...control}
                  disabled={scheduleLocked}
                  onChange={(endTime) => onChange({ endTime }, 'endTime')}
                  step={30}
                  value={values.endTime}
                />
              )}
            </FormField>
          </div>
          {scheduleLocked ? (
            <p className='flex items-center gap-1.5 text-xs text-on-surface-variant'>
              <Icon className='text-sm text-primary' name='lock' />
              {t(`${k}.summary.lockedSchedule`)}
            </p>
          ) : null}
        </section>

        <section className='space-y-3.5 rounded-xl bg-surface-container-low/45 p-4'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface' id='shift-deadline-label'>
                <Icon className='text-base text-primary' name='event_available' />
                {t(`${k}.deadline`)}
              </h3>
              <span className='text-xs font-medium text-on-surface-variant tabular-nums'>{deadlineText}</span>
            </div>
            <div aria-labelledby='shift-deadline-label' className='flex flex-wrap gap-1.5' role='group'>
              {(['h24', 'h12', 'custom'] as DeadlineMode[]).map((mode) => (
                <button
                  aria-pressed={values.deadlineMode === mode}
                  className={`${chip} ${values.deadlineMode === mode ? chipOn : chipOff}`}
                  key={mode}
                  onClick={() => onChange({ deadlineMode: mode }, 'deadline')}
                  type='button'
                >
                  {t(`${k}.deadlineOptions.${mode}`)}
                </button>
              ))}
            </div>
          </div>

          {values.deadlineMode === 'custom' ? (
            <div className='grid grid-cols-2 gap-3'>
              <FormField error={error('deadline')} label={t(`${k}.deadlineDate`)}>
                {(control) => (
                  <DatePicker
                    {...control}
                    max={values.workDate || undefined}
                    min={today}
                    onChange={(deadlineDate) => onChange({ deadlineDate }, 'deadline')}
                    value={values.deadlineDate}
                  />
                )}
              </FormField>
              <FormField label={t(`${k}.deadlineTime`)}>
                {(control) => (
                  <TimeSelect
                    {...control}
                    aria-invalid={errors.deadline ? true : undefined}
                    onChange={(deadlineTime) => onChange({ deadlineTime }, 'deadline')}
                    step={30}
                    value={values.deadlineTime}
                  />
                )}
              </FormField>
            </div>
          ) : null}

          {allowRepeat ? (
            <div className='space-y-3 border-t border-outline-variant/40 pt-3'>
              <label className='flex cursor-pointer items-start justify-between gap-3 text-sm'>
                <div>
                  <span className='font-semibold text-on-surface'>{t(`${k}.repeat.toggle`)}</span>
                  <span className='block text-xs text-on-surface-variant'>{t(`${k}.repeat.hint`)}</span>
                </div>
                <input
                  checked={values.repeat}
                  className='mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]'
                  onChange={(event) => onChange({ repeat: event.target.checked }, 'repeat')}
                  type='checkbox'
                />
              </label>
              {values.repeat ? (
                <div className='space-y-3 pt-1'>
                  <div className='grid gap-3 sm:grid-cols-[11rem_1fr] sm:items-start'>
                    <FormField label={t(`${k}.repeat.to`)}>
                      {(control) => (
                        <DatePicker
                          {...control}
                          min={values.workDate || today}
                          onChange={(repeatTo) => onChange({ repeatTo }, 'repeat')}
                          value={values.repeatTo}
                        />
                      )}
                    </FormField>
                    <div className='space-y-1.5'>
                      <p className='text-sm font-semibold text-on-surface' id='shift-weekdays-label'>
                        {t(`${k}.repeat.weekdays`)}
                      </p>
                      <div aria-labelledby='shift-weekdays-label' className='flex flex-wrap gap-1.5' role='group'>
                        {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
                          const on = values.weekdays.includes(weekday)
                          return (
                            <button
                              aria-pressed={on}
                              className={`${chip} min-w-10 justify-center px-2.5 ${on ? chipOn : chipOff}`}
                              key={weekday}
                              onClick={() =>
                                onChange(
                                  {
                                    weekdays: on
                                      ? values.weekdays.filter((day) => day !== weekday)
                                      : [...values.weekdays, weekday].sort()
                                  },
                                  'repeat'
                                )
                              }
                              type='button'
                            >
                              {t(`booking.weekdays.${weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7}`)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  {errors.repeat ? (
                    <p className='text-xs font-medium text-error' role='alert'>
                      {error('repeat')}
                    </p>
                  ) : (
                    <div className='text-xs'>
                      <p className='font-semibold text-on-surface'>
                        {days.length
                          ? t(`${k}.repeat.preview`, { count: Math.min(days.length, 31) })
                          : t(`${k}.repeat.previewEmpty`)}
                      </p>
                      {days.length > 0 ? (
                        <ul className='mt-1.5 flex max-h-16 flex-wrap gap-1 overflow-y-auto'>
                          {days.slice(0, 31).map((day) => (
                            <li className='rounded-md bg-surface-container px-2 py-0.5 text-xs tabular-nums' key={day}>
                              {format.shortDayLabel(day)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      {/* Right column: Staffing, Note & Live Preview */}
      <div className='space-y-4 lg:col-span-5'>
        <section className='space-y-3 rounded-xl bg-surface-container-low/45 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
              <Icon className='text-base text-primary' name='groups' />
              {t(`${k}.groups.staff`)}
            </h3>
            {activeCaregivers !== undefined ? (
              <span className='rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant'>
                {t(`${k}.activeCaregivers`, { count: activeCaregivers })}
              </span>
            ) : null}
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <FormField error={error('capacity')} hint={t(`${k}.capacityHint`)} label={t(`${k}.capacity`)}>
              {(control) => (
                <NumberStepper
                  {...control}
                  max={MAX_CAPACITY}
                  min={1}
                  onChange={(capacity) => onChange({ capacity }, 'capacity')}
                  value={values.capacity}
                />
              )}
            </FormField>
            <FormField error={error('maxBookings')} label={t(`${k}.maxBookings`)}>
              {(control) => (
                <NumberStepper
                  {...control}
                  max={MAX_BOOKINGS}
                  min={1}
                  onChange={(maxBookings) => onChange({ maxBookings }, 'maxBookings')}
                  value={values.maxBookings}
                />
              )}
            </FormField>
          </div>
          <p className='text-xs leading-relaxed text-on-surface-variant'>{t(`${k}.maxBookingsHint`)}</p>
        </section>

        <section className='rounded-xl bg-surface-container-low/45 p-4'>
          <FormField
            error={error('note')}
            hint={t(`${k}.noteCounter`, { count: values.note.trim().length })}
            label={t(`${k}.note`)}
          >
            {(control) => (
              <Textarea
                {...control}
                className='min-h-16 resize-y'
                maxLength={MAX_NOTE + 50}
                onChange={(event) => onChange({ note: event.target.value }, 'note')}
                placeholder={t(`${k}.notePlaceholder`)}
                rows={2}
                value={values.note}
              />
            )}
          </FormField>
        </section>

        {summary}
      </div>
    </div>
  )
}
