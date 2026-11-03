import type { KeyboardEvent } from 'react'

import { useCaregiverFormat } from './caregiver-format'

export interface DayMarks {
  /** Tailwind classes of the small dots under a day, one per layer present that day. */
  dots: string[]
}

/** A row of days to pick from on phones; arrow keys move between days and dots show what each day holds. */
export function DayStrip({
  days,
  value,
  today,
  marks,
  label,
  onChange
}: {
  days: string[]
  value: string
  today: string
  marks: Record<string, DayMarks | undefined>
  label: string
  onChange: (day: string) => void
}) {
  const format = useCaregiverFormat()

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = days.indexOf(value)
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : -1
    if (next < 0 || next >= days.length) return
    event.preventDefault()
    onChange(days[next])
    event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  }

  return (
    <div aria-label={label} className='grid grid-cols-7 gap-1' onKeyDown={onKeyDown} role='radiogroup'>
      {days.map((day) => {
        const selected = day === value
        return (
          <button
            aria-checked={selected}
            aria-label={`${format.weekdayLong(day)}, ${format.date(day)}`}
            className={`cg-press flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl text-center focus-visible:outline-2 focus-visible:outline-primary ${selected ? 'bg-primary text-on-primary shadow-[var(--cg-shadow-1)]' : day === today ? 'bg-brand-50 text-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
            key={day}
            onClick={() => onChange(day)}
            role='radio'
            tabIndex={selected ? 0 : -1}
            type='button'
          >
            <span className={`text-[11px] font-medium ${selected ? 'text-on-primary/85' : 'text-on-surface-variant'}`}>
              {format.weekday(day)}
            </span>
            <span className='text-base font-semibold tabular-nums'>{Number(day.slice(8))}</span>
            <span aria-hidden='true' className='flex h-1.5 gap-0.5'>
              {(marks[day]?.dots ?? []).map((dot) => (
                <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-on-primary' : dot}`} key={dot} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
