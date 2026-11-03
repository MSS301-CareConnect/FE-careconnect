import { forwardRef, type SelectHTMLAttributes } from 'react'

import { baseControlClass } from './form-field'

function times(step: number) {
  const values: string[] = []
  for (let minute = 0; minute < 24 * 60; minute += step) {
    values.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`)
  }
  return values
}

const cache = new Map<number, string[]>()

export interface TimeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  /** Minutes between options; 15 or 30. */
  step?: number
}

/**
 * 24-hour time picker ("08:00") that never shows AM/PM, whatever the browser locale. A value off the step grid (from
 * older data) stays selectable rather than being rounded.
 */
export const TimeSelect = forwardRef<HTMLSelectElement, TimeSelectProps>(function TimeSelect(
  { value, onChange, step = 15, className = '', ...props },
  ref
) {
  if (!cache.has(step)) cache.set(step, times(step))
  const options = cache.get(step) ?? []
  const all = value && !options.includes(value) ? [...options, value].sort() : options

  return (
    <select
      className={`${baseControlClass} tabular-nums ${className}`}
      onChange={(event) => onChange(event.target.value)}
      ref={ref}
      value={value}
      {...props}
    >
      {all.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  )
})
