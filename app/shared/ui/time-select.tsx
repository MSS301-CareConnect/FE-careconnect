import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent
} from 'react'
import { useTranslation } from 'react-i18next'

import { baseControlClass } from './form-field'
import { Icon } from './icon'
import { popoverAttribute, popoverPanelClass, stopLabelForwarding, useAnchoredPopover } from './use-anchored-popover'

const GROUPS = [
  { key: 'night', from: 0 },
  { key: 'morning', from: 6 },
  { key: 'afternoon', from: 12 },
  { key: 'evening', from: 18 }
] as const

const pad = (value: number) => String(value).padStart(2, '0')
const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
const toMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

export interface TimeSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Minutes between options; 15 or 30. */
  step?: number
  disabled?: boolean
  className?: string
  /** Times outside this range (HH:mm, inclusive) are marked and cannot be picked. */
  min?: string
  max?: string
  /** Extra rule for times that cannot be picked. */
  isTimeDisabled?: (time: string) => boolean
  /** Tooltip on a time that cannot be picked. */
  disabledReason?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * 24-hour time picker ("08:00") that never shows AM/PM, whatever the browser locale. The field is a select-only
 * combobox; its popover lays the times out one hour per row, grouped into night / morning / afternoon / evening, and
 * opens scrolled to the current value. Keyboard: ←/→ one step, ↑/↓ one hour, PageUp/PageDown three hours, Home/End,
 * Enter picks, Esc closes. A value off the step grid (from older data) is kept as it is rather than rounded.
 */
export const TimeSelect = forwardRef<HTMLButtonElement, TimeSelectProps>(function TimeSelect(
  {
    id,
    value,
    onChange,
    step = 15,
    disabled = false,
    className = '',
    min,
    max,
    isTimeDisabled,
    disabledReason,
    ...aria
  },
  ref
) {
  const { t } = useTranslation()
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const listId = `${triggerId}-times`
  const [open, setOpen] = useState(false)
  const [focusMinute, setFocusMinute] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)

  const dismiss = useCallback(() => setOpen(false), [])
  const side = useAnchoredPopover({ open, anchorRef: triggerRef, panelRef, rootRef, onDismiss: dismiss })

  const perHour = Math.max(1, Math.round(60 / step))
  const current = toMinutes(value)
  const minMinutes = min ? toMinutes(min) : null
  const maxMinutes = max ? toMinutes(max) : null
  const blocked = (minutes: number) =>
    (minMinutes !== null && minutes < minMinutes) ||
    (maxMinutes !== null && minutes > maxMinutes) ||
    Boolean(isTimeDisabled?.(toTime(minutes)))

  useEffect(() => {
    if (!open) return
    const option = listRef.current?.querySelector<HTMLElement>(`[data-minute="${focusMinute}"]`)
    if (!option) return
    option.focus({ preventScroll: true })
    const list = listRef.current
    if (!list) return
    const above = option.offsetTop < list.scrollTop + 32
    const below = option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight
    if (above || below) list.scrollTop = Math.max(0, option.offsetTop - list.clientHeight / 2 + option.offsetHeight / 2)
  }, [open, focusMinute])

  function show() {
    if (disabled) return
    const snapped = current === null ? 8 * 60 : Math.round(current / step) * step
    setFocusMinute(Math.min(snapped, 24 * 60 - step))
    setOpen(true)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function pick(minutes: number) {
    if (blocked(minutes)) return
    onChange(toTime(minutes))
    close()
  }

  function onTriggerKey(event: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key) && !open) {
      event.preventDefault()
      show()
    }
  }

  function onListKey(event: KeyboardEvent) {
    const last = 24 * 60 - step
    const rowStart = focusMinute - (focusMinute % 60)
    const moves: Record<string, number> = {
      ArrowLeft: focusMinute - step,
      ArrowRight: focusMinute + step,
      ArrowUp: focusMinute - 60,
      ArrowDown: focusMinute + 60,
      PageUp: focusMinute - 180,
      PageDown: focusMinute + 180,
      Home: event.ctrlKey ? 0 : rowStart,
      End: event.ctrlKey ? last : rowStart + 60 - step
    }
    if (event.key in moves) {
      event.preventDefault()
      setFocusMinute(Math.min(last, Math.max(0, moves[event.key])))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  const hours = Array.from({ length: 24 }, (_, hour) => hour)

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        {...aria}
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        aria-haspopup='listbox'
        className={`${baseControlClass} flex items-center justify-between gap-2 text-left tabular-nums ${open ? 'border-primary ring-2 ring-primary/25' : 'hover:border-brand-300'}`}
        disabled={disabled}
        id={triggerId}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onTriggerKey}
        ref={triggerRef}
        role='combobox'
        type='button'
      >
        <span className={value ? 'text-on-surface' : 'text-outline'}>{value || t('common.kit.timePlaceholder')}</span>
        <Icon
          className={`text-lg transition-colors ${open ? 'text-primary' : 'text-on-surface-variant'}`}
          name='schedule'
        />
      </button>
      {open ? (
        <div
          className={`${popoverPanelClass} cc-scale-in w-[17.5rem] max-w-[calc(100vw-1rem)] p-1.5 ${side === 'top' ? 'origin-bottom-left' : 'origin-top-left'}`}
          onClick={(event: MouseEvent) => stopLabelForwarding(event)}
          popover={popoverAttribute}
          ref={panelRef}
        >
          <div
            aria-label={t('common.kit.chooseTime')}
            className='relative max-h-72 overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin]'
            id={listId}
            onKeyDown={onListKey}
            ref={listRef}
            role='listbox'
          >
            {GROUPS.map((group) => (
              <div aria-labelledby={`${listId}-${group.key}`} key={group.key} role='group'>
                <p
                  className='sticky top-0 z-10 bg-surface-container-lowest/95 px-2 pt-2 pb-1 text-[0.6875rem] font-semibold tracking-wide text-on-surface-variant uppercase backdrop-blur-sm'
                  id={`${listId}-${group.key}`}
                  role='presentation'
                >
                  {t(`common.kit.timeGroups.${group.key}`)}
                </p>
                {hours
                  .filter((hour) => hour >= group.from && hour < group.from + 6)
                  .map((hour) => (
                    <div
                      className='grid gap-1 py-0.5'
                      key={hour}
                      role='presentation'
                      style={{ gridTemplateColumns: `repeat(${perHour}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: perHour }, (_, index) => {
                        const minutes = hour * 60 + index * step
                        const time = toTime(minutes)
                        const selected = minutes === current
                        const isBlocked = blocked(minutes)
                        const onTheHour = index === 0
                        return (
                          <div
                            aria-disabled={isBlocked || undefined}
                            aria-selected={selected}
                            className={`grid min-h-10 cursor-pointer place-items-center rounded-lg text-sm tabular-nums transition-colors outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                              selected
                                ? 'bg-primary font-semibold text-on-primary'
                                : isBlocked
                                  ? 'cursor-not-allowed text-outline/60 line-through decoration-outline/40'
                                  : onTheHour
                                    ? 'font-semibold text-on-surface hover:bg-brand-50 focus-visible:bg-brand-50'
                                    : 'text-on-surface-variant hover:bg-brand-50 hover:text-on-surface focus-visible:bg-brand-50'
                            }`}
                            data-minute={minutes}
                            key={minutes}
                            onClick={() => pick(minutes)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                pick(minutes)
                              }
                            }}
                            role='option'
                            tabIndex={minutes === focusMinute ? 0 : -1}
                            title={isBlocked ? disabledReason : undefined}
                          >
                            {time}
                          </div>
                        )
                      })}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
})
