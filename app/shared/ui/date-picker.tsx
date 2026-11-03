import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { addDays, dateLocale, formatCalendarDate, isoWeekday } from '~/shared/lib/format'

import { baseControlClass } from './form-field'
import { Icon } from './icon'

const WEEKDAY_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const

/** "20/05/1945" → "1945-05-20"; null when the text is not a real date. */
export function parseDayInput(text: string) {
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text.trim())
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso
}

function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`
}

function shiftMonth(month: string, amount: number) {
  const date = new Date(`${month}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 10)
}

export interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  /** First selectable day (YYYY-MM-DD); earlier days are disabled in the calendar. */
  min?: string
  max?: string
  /** Tooltip on a disabled day, e.g. why it is too early. */
  disabledReason?: string
  /** Day the calendar opens on when there is no value. */
  defaultMonth?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  className?: string
}

/**
 * Day-first date input (dd/mm/yyyy) that never depends on the browser's date format, with a calendar popover.
 * Typed values are never corrected: an unreadable one gets a note under the input.
 */
export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  disabledReason,
  defaultMonth,
  className = '',
  ...aria
}: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const noteId = `${inputId}-format`
  const language = i18n.language
  const [text, setText] = useState(() => formatCalendarDate(value))
  const [shownValue, setShownValue] = useState(value)
  const [shownLanguage, setShownLanguage] = useState(language)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => monthStart(value || defaultMonth || min || '2026-01-01'))
  const [focusDay, setFocusDay] = useState(value || defaultMonth || min || '')
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  if (value !== shownValue || language !== shownLanguage) {
    setShownValue(value)
    setShownLanguage(language)
    setText(formatCalendarDate(value))
  }

  const unreadable = text.trim() !== '' && parseDayInput(text) === null

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus()
  }, [open, focusDay, month])

  function commit(next: string) {
    setText(next)
    const parsed = parseDayInput(next)
    if (parsed) onChange(parsed)
    else if (next.trim() === '') onChange('')
  }

  function openCalendar() {
    const start = value || defaultMonth || min || ''
    if (start) {
      setMonth(monthStart(start))
      setFocusDay(start)
    }
    setOpen(true)
  }

  const disabled = (day: string) => Boolean((min && day < min) || (max && day > max))

  function pick(day: string) {
    if (disabled(day)) return
    onChange(day)
    setOpen(false)
    rootRef.current?.querySelector('input')?.focus()
  }

  function onGridKey(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (event.key in moves) {
      event.preventDefault()
      const next = addDays(focusDay, moves[event.key])
      setFocusDay(next)
      if (monthStart(next) !== month) setMonth(monthStart(next))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      rootRef.current?.querySelector('input')?.focus()
    }
  }

  const leading = isoWeekday(month) - 1
  const firstCell = addDays(month, -leading)
  const cells = Array.from({ length: 42 }, (_, index) => addDays(firstCell, index))
  const title = new Intl.DateTimeFormat(dateLocale(language), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${month}T00:00:00Z`))

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <div className='relative'>
        <input
          {...aria}
          aria-describedby={
            [aria['aria-describedby'], unreadable ? noteId : null].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={unreadable || aria['aria-invalid'] === true || aria['aria-invalid'] === 'true' || undefined}
          autoComplete='off'
          className={`${baseControlClass} pr-11 tabular-nums`}
          id={inputId}
          inputMode='numeric'
          onBlur={() => commit(text)}
          onChange={(event) => {
            setText(event.target.value)
            const parsed = parseDayInput(event.target.value)
            if (parsed) onChange(parsed)
          }}
          placeholder={t('common.kit.datePlaceholder')}
          value={text}
        />
        <button
          aria-expanded={open}
          aria-haspopup='dialog'
          aria-label={t('common.kit.openCalendar')}
          className='absolute top-1/2 right-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => (open ? setOpen(false) : openCalendar())}
          type='button'
        >
          <Icon className='text-xl' name='calendar_month' />
        </button>
      </div>
      {unreadable ? (
        <p className='mt-1 text-xs text-error' id={noteId}>
          {t('common.kit.invalidDate')}
        </p>
      ) : null}
      {open ? (
        <div
          aria-label={t('common.kit.openCalendar')}
          className='cc-scale-in absolute top-full left-0 z-40 mt-2 w-[19rem] origin-top-left rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-[var(--shadow-raised)]'
          role='dialog'
        >
          <div className='mb-2 flex items-center justify-between'>
            <button
              aria-label={t('common.kit.previousMonth')}
              className='grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setMonth(shiftMonth(month, -1))}
              type='button'
            >
              <Icon name='chevron_left' />
            </button>
            <p aria-live='polite' className='text-sm font-semibold capitalize text-on-surface'>
              {title}
            </p>
            <button
              aria-label={t('common.kit.nextMonth')}
              className='grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setMonth(shiftMonth(month, 1))}
              type='button'
            >
              <Icon name='chevron_right' />
            </button>
          </div>
          <div className='grid grid-cols-7 text-center text-xs font-medium text-on-surface-variant' aria-hidden='true'>
            {WEEKDAY_KEYS.map((day) => (
              <span className='py-1' key={day}>
                {t(`booking.weekdays.${day}`)}
              </span>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-0.5' onKeyDown={onGridKey} ref={gridRef} role='grid'>
            {cells.map((day) => {
              const outside = monthStart(day) !== month
              const blocked = disabled(day)
              const selected = day === value
              return (
                <button
                  aria-disabled={blocked || undefined}
                  aria-label={formatCalendarDate(day)}
                  aria-pressed={selected}
                  className={`grid h-9 place-items-center rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-primary ${selected ? 'bg-primary font-semibold text-on-primary' : blocked ? 'cursor-not-allowed text-outline/60 line-through decoration-outline/40' : outside ? 'text-on-surface-variant/60 hover:bg-surface-container-low' : 'text-on-surface hover:bg-brand-50'}`}
                  data-focus={day === focusDay}
                  key={day}
                  onClick={() => pick(day)}
                  tabIndex={day === focusDay ? 0 : -1}
                  title={blocked ? disabledReason : undefined}
                  type='button'
                >
                  {Number(day.slice(8))}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
