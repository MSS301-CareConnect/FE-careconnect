import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { formatCalendarDate } from '~/shared/lib/format'

import { CalendarPanel } from './calendar-panel'
import { baseControlClass } from './form-field'
import { Icon } from './icon'
import { useAnchoredPopover } from './use-anchored-popover'

/** "20/05/1945" → "1945-05-20"; null when the text is not a real date. */
export function parseDayInput(text: string) {
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text.trim())
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : iso
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
  disabled?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-label'?: string
  className?: string
}

/**
 * Day-first date input (dd/mm/yyyy) that never depends on the browser's date format, with a calendar popover that
 * opens from the icon or a click in the input (see `CalendarPanel`). The popover lives in the top layer, so dialogs
 * and scroll containers never clip it. Typed values are never corrected: an unreadable one gets a note under the input.
 */
export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  disabledReason,
  defaultMonth,
  disabled = false,
  className = '',
  ...aria
}: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const noteId = `${inputId}-format`
  const panelId = `${inputId}-calendar`
  const language = i18n.language
  const [text, setText] = useState(() => formatCalendarDate(value))
  const [shownValue, setShownValue] = useState(value)
  const [shownLanguage, setShownLanguage] = useState(language)
  const [open, setOpen] = useState(false)
  const [focusOnOpen, setFocusOnOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (value !== shownValue || language !== shownLanguage) {
    setShownValue(value)
    setShownLanguage(language)
    setText(formatCalendarDate(value))
  }

  const unreadable = text.trim() !== '' && parseDayInput(text) === null
  const dismiss = useCallback(() => setOpen(false), [])
  const side = useAnchoredPopover({ open, anchorRef, panelRef, rootRef, onDismiss: dismiss })

  function commit(next: string) {
    setText(next)
    const parsed = parseDayInput(next)
    if (parsed) onChange(parsed)
    else if (next.trim() === '') onChange('')
  }

  function openCalendar(moveFocus: boolean) {
    if (disabled) return
    setFocusOnOpen(moveFocus)
    setOpen(true)
  }

  function close(restoreFocus: boolean) {
    setOpen(false)
    if (restoreFocus) inputRef.current?.focus()
  }

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && (event.altKey || !open)) {
      event.preventDefault()
      if (open) setOpen(false)
      openCalendar(true)
    } else if (event.key === 'ArrowDown' && open) {
      event.preventDefault()
      panelRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus()
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div
      className={`relative ${className}`}
      onBlur={(event) => {
        // Tabbing out of the input and the calendar closes it; a click inside does not.
        const next = event.relatedTarget as Node | null
        if (open && next && !rootRef.current?.contains(next)) setOpen(false)
      }}
      ref={rootRef}
    >
      <div className='relative' ref={anchorRef}>
        <input
          {...aria}
          aria-describedby={
            [aria['aria-describedby'], unreadable ? noteId : null].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={unreadable || aria['aria-invalid'] === true || aria['aria-invalid'] === 'true' || undefined}
          autoComplete='off'
          className={`${baseControlClass} pr-12 tabular-nums`}
          disabled={disabled}
          id={inputId}
          inputMode='numeric'
          onBlur={() => commit(text)}
          onChange={(event) => {
            setText(event.target.value)
            const parsed = parseDayInput(event.target.value)
            if (parsed) onChange(parsed)
          }}
          onClick={() => {
            if (!open) openCalendar(false)
          }}
          onKeyDown={onInputKey}
          placeholder={t('common.kit.datePlaceholder')}
          ref={inputRef}
          value={text}
        />
        <button
          aria-controls={open ? panelId : undefined}
          aria-expanded={open}
          aria-haspopup='dialog'
          aria-label={t('common.kit.openCalendar')}
          className={`absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${open ? 'bg-brand-50 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
          disabled={disabled}
          onClick={() => (open ? close(true) : openCalendar(true))}
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
        <CalendarPanel
          disabledReason={disabledReason}
          focusOnOpen={focusOnOpen}
          id={panelId}
          max={max}
          min={min}
          onClose={close}
          onPick={(day) => {
            onChange(day)
            setText(formatCalendarDate(day))
            close(true)
          }}
          panelRef={panelRef}
          side={side}
          startDay={defaultMonth || min || ''}
          value={value}
        />
      ) : null}
    </div>
  )
}
