import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import { addDays, calendarDayOf, dateLocale, formatCalendarDate, isoWeekday } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'

import { Icon } from './icon'
import { popoverAttribute, popoverPanelClass, stopLabelForwarding, type PopoverSide } from './use-anchored-popover'

const WEEKDAY_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const
const YEARS_PER_PAGE = 12

type View = 'days' | 'months' | 'years'

export function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`
}

function shiftMonth(month: string, amount: number) {
  const date = new Date(`${month}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 10)
}

/** Same day of month in another month, clamped to that month's length (31/01 + 1 month → 28/02). */
function shiftDayByMonths(day: string, amount: number) {
  const target = shiftMonth(monthStart(day), amount)
  const lastDay = addDays(shiftMonth(target, 1), -1)
  const wanted = `${target.slice(0, 8)}${day.slice(8)}`
  return wanted > lastDay || Number.isNaN(new Date(`${wanted}T00:00:00Z`).getTime()) ? lastDay : wanted
}

const headerButton =
  'grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'

export interface CalendarPanelProps {
  id: string
  panelRef: RefObject<HTMLDivElement | null>
  side: PopoverSide
  /** `open` or `closed` from `useExitPresence`, for the open / close animation. */
  state?: 'open' | 'closed'
  value: string
  min?: string
  max?: string
  disabledReason?: string
  /** Day shown first when there is no value. */
  startDay: string
  /** Move keyboard focus into the day grid on open (opened from the button or with ArrowDown). */
  focusOnOpen: boolean
  onPick: (day: string) => void
  /** Close; `restoreFocus` returns focus to the input. */
  onClose: (restoreFocus: boolean) => void
}

/**
 * The popover of `DatePicker`: a month grid with today and the chosen day marked, a month → year jump from the title,
 * and the keyboard of a date grid (arrows, Home/End, PageUp/PageDown, Shift+PageUp/PageDown for a year, Esc).
 * Mounted only while open, so it starts on the current value every time.
 */
export function CalendarPanel({
  id,
  panelRef,
  side,
  state = 'open',
  value,
  min,
  max,
  disabledReason,
  startDay,
  focusOnOpen,
  onPick,
  onClose
}: CalendarPanelProps) {
  const { t, i18n } = useTranslation()
  const locale = dateLocale(i18n.language)
  const hintId = useId()
  const now = useClock(60 * 60_000)
  const today = calendarDayOf(new Date(now))
  const first = value || startDay || today
  const [view, setView] = useState<View>('days')
  const [month, setMonth] = useState(() => monthStart(first))
  const [focusDay, setFocusDay] = useState(first)
  const [yearPage, setYearPage] = useState(() => Number(first.slice(0, 4)) - 5)
  const keyboardActive = useRef(focusOnOpen)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!keyboardActive.current) return
    bodyRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus()
  }, [view, focusDay, month, yearPage])

  const disabled = (day: string) => Boolean((min && day < min) || (max && day > max))
  const monthOut = (start: string) => {
    const end = addDays(shiftMonth(start, 1), -1)
    return Boolean((min && end < min) || (max && start > max))
  }

  function moveFocus(next: string) {
    keyboardActive.current = true
    setFocusDay(next)
    if (monthStart(next) !== month) setMonth(monthStart(next))
  }

  function onDaysKey(event: KeyboardEvent) {
    const weekday = isoWeekday(focusDay)
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      Home: () => addDays(focusDay, 1 - weekday),
      End: () => addDays(focusDay, 7 - weekday),
      PageUp: () => shiftDayByMonths(focusDay, event.shiftKey ? -12 : -1),
      PageDown: () => shiftDayByMonths(focusDay, event.shiftKey ? 12 : 1)
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    moveFocus(move())
  }

  function onPanelKey(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    // Keep the key from also closing a surrounding dialog.
    event.preventDefault()
    event.stopPropagation()
    if (view !== 'days') {
      keyboardActive.current = true
      setView('days')
    } else onClose(true)
  }

  /** The focused day moved into the month that starts on `start`. */
  function sameDayIn(start: string) {
    const months =
      (Number(start.slice(0, 4)) - Number(focusDay.slice(0, 4))) * 12 +
      Number(start.slice(5, 7)) -
      Number(focusDay.slice(5, 7))
    return shiftDayByMonths(focusDay, months)
  }

  function navigate(amount: number) {
    if (view === 'days') {
      setMonth(shiftMonth(month, amount))
      setFocusDay(shiftDayByMonths(focusDay, amount))
    } else if (view === 'months') {
      setMonth(shiftMonth(month, amount * 12))
    } else setYearPage(yearPage + amount * YEARS_PER_PAGE)
  }

  function openMonths() {
    keyboardActive.current = true
    setView(view === 'days' ? 'months' : 'years')
    if (view === 'months') setYearPage(Number(month.slice(0, 4)) - 5)
  }

  const year = Number(month.slice(0, 4))
  const titleFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const monthName = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
  const title =
    view === 'days'
      ? titleFormat.format(new Date(`${month}T00:00:00Z`))
      : view === 'months'
        ? String(year)
        : `${yearPage} – ${yearPage + YEARS_PER_PAGE - 1}`
  const [previousLabel, nextLabel] =
    view === 'days'
      ? [t('common.kit.previousMonth'), t('common.kit.nextMonth')]
      : [t('common.kit.previousYear'), t('common.kit.nextYear')]

  const firstCell = addDays(month, 1 - isoWeekday(month))
  const weeks = Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, index) => addDays(firstCell, week * 7 + index))
  )
  const choiceClass = (selected: boolean, current: boolean, out: boolean) =>
    `grid h-11 place-items-center rounded-xl text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${selected ? 'bg-primary font-semibold text-on-primary' : current ? 'font-semibold text-primary ring-1 ring-primary/50 ring-inset hover:bg-brand-50' : out ? 'text-outline hover:bg-surface-container-low' : 'text-on-surface hover:bg-brand-50'}`

  return (
    <div
      aria-label={t('common.kit.openCalendar')}
      className={`${popoverPanelClass} cc-dropdown w-[20.5rem] max-w-[calc(100vw-1rem)] p-3 ${side === 'top' ? 'origin-bottom-left' : 'origin-top-left'}`}
      data-side={side}
      data-state={state}
      id={id}
      onClick={stopLabelForwarding}
      onKeyDown={onPanelKey}
      popover={popoverAttribute}
      ref={panelRef}
      role='dialog'
    >
      <div className='mb-2 flex items-center justify-between gap-1'>
        <button aria-label={previousLabel} className={headerButton} onClick={() => navigate(-1)} type='button'>
          <Icon name='chevron_left' />
        </button>
        <button
          aria-label={view === 'years' ? t('common.kit.backToDays') : t('common.kit.chooseMonthYear')}
          className='inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-on-surface capitalize transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => (view === 'years' ? setView('days') : openMonths())}
          type='button'
        >
          <span aria-live='polite' className='tabular-nums'>
            {title}
          </span>
          <Icon
            className={`text-lg text-on-surface-variant transition-transform duration-200 ${view === 'days' ? '' : 'rotate-180'}`}
            name='expand_more'
          />
        </button>
        <button aria-label={nextLabel} className={headerButton} onClick={() => navigate(1)} type='button'>
          <Icon name='chevron_right' />
        </button>
      </div>

      <div ref={bodyRef}>
        {view === 'days' ? (
          <>
            <div
              aria-hidden='true'
              className='grid grid-cols-7 text-center text-xs font-semibold text-on-surface-variant'
            >
              {WEEKDAY_KEYS.map((day) => (
                <span className='py-1.5' key={day}>
                  {t(`booking.weekdays.${day}`)}
                </span>
              ))}
            </div>
            <div aria-describedby={hintId} aria-label={title} onKeyDown={onDaysKey} role='grid'>
              {weeks.map((week) => (
                <div className='grid grid-cols-7 gap-0.5' key={week[0]} role='row'>
                  {week.map((day) => {
                    const outside = monthStart(day) !== month
                    const blocked = disabled(day)
                    const selected = day === value
                    const isToday = day === today
                    return (
                      <button
                        aria-current={isToday ? 'date' : undefined}
                        aria-disabled={blocked || undefined}
                        aria-label={formatCalendarDate(day)}
                        aria-selected={selected}
                        className={`relative grid h-10 place-items-center rounded-full text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                          selected
                            ? 'bg-primary font-semibold text-on-primary shadow-sm'
                            : blocked
                              ? 'cursor-not-allowed text-outline/60 line-through decoration-outline/40'
                              : isToday
                                ? 'font-semibold text-primary ring-1 ring-primary/60 ring-inset hover:bg-brand-50'
                                : outside
                                  ? 'text-on-surface-variant/55 hover:bg-surface-container-low'
                                  : 'text-on-surface hover:bg-brand-50'
                        }`}
                        data-focus={day === focusDay}
                        key={day}
                        onClick={() => {
                          if (!blocked) onPick(day)
                        }}
                        role='gridcell'
                        tabIndex={day === focusDay ? 0 : -1}
                        title={blocked ? disabledReason : undefined}
                        type='button'
                      >
                        {Number(day.slice(8))}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className='sr-only' id={hintId}>
              {t('common.kit.calendarHint')}
            </p>
            <div className='mt-2 flex items-center justify-between border-t border-outline-variant/60 pt-2'>
              <button
                aria-disabled={disabled(today) || undefined}
                className='inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary aria-disabled:cursor-not-allowed aria-disabled:text-outline'
                onClick={() => {
                  if (disabled(today)) moveFocus(today)
                  else onPick(today)
                }}
                title={disabled(today) ? disabledReason : undefined}
                type='button'
              >
                <Icon className='text-lg' name='today' />
                {t('common.kit.today')}
              </button>
              <button
                className='inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                onClick={() => onClose(true)}
                type='button'
              >
                {t('common.kit.closePanel')}
              </button>
            </div>
          </>
        ) : view === 'months' ? (
          <div className='grid grid-cols-3 gap-1.5 pt-1'>
            {Array.from({ length: 12 }, (_, index) => {
              const start = `${year}-${String(index + 1).padStart(2, '0')}-01`
              return (
                <button
                  aria-pressed={start === month}
                  className={choiceClass(
                    start === monthStart(value || ''),
                    start === monthStart(today),
                    monthOut(start)
                  )}
                  data-focus={start === month}
                  key={start}
                  onClick={() => {
                    keyboardActive.current = true
                    setMonth(start)
                    setFocusDay(sameDayIn(start))
                    setView('days')
                  }}
                  type='button'
                >
                  {monthName.format(new Date(`${start}T00:00:00Z`))}
                </button>
              )
            })}
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-1.5 pt-1'>
            {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
              const candidate = yearPage + index
              const out = Boolean((min && `${candidate}-12-31` < min) || (max && `${candidate}-01-01` > max))
              return (
                <button
                  aria-pressed={candidate === year}
                  className={`${choiceClass(candidate === Number((value || '0').slice(0, 4)), candidate === Number(today.slice(0, 4)), out)} tabular-nums`}
                  data-focus={candidate === year}
                  key={candidate}
                  onClick={() => {
                    keyboardActive.current = true
                    setMonth(`${candidate}${month.slice(4)}`)
                    setView('months')
                  }}
                  type='button'
                >
                  {candidate}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
