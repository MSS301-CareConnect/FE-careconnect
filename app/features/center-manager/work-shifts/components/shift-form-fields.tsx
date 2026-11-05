import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SHIFT_TYPE_CODES, SHIFT_TYPE_PRESETS, shiftTypeLabelKey } from '~/entities/provider/work-shift'
import { addDays, minutesBetween, useFormat } from '~/shared/lib/format'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { NumberStepper } from '~/shared/ui/number-stepper'
import { TimeSelect } from '~/shared/ui/time-select'

import {
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
  'inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
const chipOn = 'border-primary bg-primary text-on-primary'
const chipOff =
  'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300 hover:bg-brand-50'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className='space-y-4 rounded-2xl border border-outline-variant/50 p-4'>
      <legend className='px-1 text-sm font-semibold text-on-surface'>{title}</legend>
      {children}
    </fieldset>
  )
}

export function ShiftFormFields({
  values,
  errors,
  today,
  allowRepeat,
  scheduleLocked,
  deadlineText,
  activeCaregivers,
  onChange
}: {
  values: ShiftFormValues
  errors: Partial<Record<ShiftField, ShiftErrorKey>>
  today: string
  allowRepeat: boolean
  scheduleLocked: boolean
  deadlineText: string
  activeCaregivers?: number
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
    <div className='space-y-4'>
      <Group title={t(`${k}.groups.time`)}>
        <FormField error={error('workDate')} label={t(`${k}.date`)}>
          {(control) => (
            <div className='space-y-2'>
              <DatePicker
                {...control}
                className='max-w-56'
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
        <div className='space-y-2'>
          <p className='text-sm font-semibold' id='shift-type-label'>
            {t(`${k}.type`)}
          </p>
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
          <p className='text-xs text-on-surface-variant'>{t(`${k}.typeHint`)}</p>
          {errors.shiftType ? (
            <p className='text-xs font-medium text-error' role='alert'>
              {error('shiftType')}
            </p>
          ) : null}
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
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
        {minutes > 0 ? (
          <p className='text-sm text-on-surface-variant'>{t(`${k}.duration`, { value: format.duration(minutes) })}</p>
        ) : null}
        {scheduleLocked ? <p className='text-sm text-on-surface-variant'>{t(`${k}.summary.lockedSchedule`)}</p> : null}
      </Group>

      <Group title={t(`${k}.groups.staff`)}>
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
        {activeCaregivers !== undefined ? (
          <p className='text-sm text-on-surface-variant'>{t(`${k}.activeCaregivers`, { count: activeCaregivers })}</p>
        ) : null}
      </Group>

      <Group title={t(`${k}.groups.registration`)}>
        <div className='space-y-2'>
          <p className='text-sm font-semibold' id='shift-deadline-label'>
            {t(`${k}.deadline`)}
          </p>
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
          <div className='grid gap-3 sm:grid-cols-2'>
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
        <p className='text-sm text-on-surface-variant'>{deadlineText}</p>
      </Group>

      <Group title={t(`${k}.groups.note`)}>
        <FormField
          error={error('note')}
          hint={t(`${k}.noteCounter`, { count: values.note.trim().length })}
          label={t(`${k}.note`)}
        >
          {(control) => (
            <Textarea
              {...control}
              maxLength={MAX_NOTE + 50}
              onChange={(event) => onChange({ note: event.target.value }, 'note')}
              placeholder={t(`${k}.notePlaceholder`)}
              rows={3}
              value={values.note}
            />
          )}
        </FormField>
      </Group>

      {allowRepeat ? (
        <Group title={t(`${k}.repeat.toggle`)}>
          <label className='flex items-start gap-3 text-sm'>
            <input
              checked={values.repeat}
              className='mt-0.5 h-5 w-5 accent-[var(--color-primary)]'
              onChange={(event) => onChange({ repeat: event.target.checked }, 'repeat')}
              type='checkbox'
            />
            <span>{t(`${k}.repeat.hint`)}</span>
          </label>
          {values.repeat ? (
            <>
              <FormField label={t(`${k}.repeat.to`)}>
                {(control) => (
                  <DatePicker
                    {...control}
                    className='max-w-56'
                    min={values.workDate || today}
                    onChange={(repeatTo) => onChange({ repeatTo }, 'repeat')}
                    value={values.repeatTo}
                  />
                )}
              </FormField>
              <div className='space-y-2'>
                <p className='text-sm font-semibold' id='shift-weekdays-label'>
                  {t(`${k}.repeat.weekdays`)}
                </p>
                <div aria-labelledby='shift-weekdays-label' className='flex flex-wrap gap-1.5' role='group'>
                  {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
                    const on = values.weekdays.includes(weekday)
                    return (
                      <button
                        aria-pressed={on}
                        className={`${chip} min-w-11 justify-center ${on ? chipOn : chipOff}`}
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
              {errors.repeat ? (
                <p className='text-xs font-medium text-error' role='alert'>
                  {error('repeat')}
                </p>
              ) : (
                <div className='text-sm'>
                  <p className='font-semibold'>
                    {days.length
                      ? t(`${k}.repeat.preview`, { count: Math.min(days.length, 31) })
                      : t(`${k}.repeat.previewEmpty`)}
                  </p>
                  <ul className='mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto'>
                    {days.slice(0, 31).map((day) => (
                      <li className='rounded-md bg-surface-container px-2 py-1 text-xs tabular-nums' key={day}>
                        {format.shortDayLabel(day)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </Group>
      ) : null}
    </div>
  )
}
