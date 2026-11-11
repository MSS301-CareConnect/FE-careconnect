import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { addDays, monthStart, useCaregiverFormat, weekStart } from '../../ui/caregiver-format'
import { clockOf, itemsOfDay, type CalendarItem } from './calendar-model'
import { TIME_OFF_STRIPES } from './calendar-item-style'

const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const

type SlotItem = Extract<CalendarItem, { kind: 'availability' }>
type VisitItem = Extract<CalendarItem, { kind: 'visit' }>
type TimeOffItem = Extract<CalendarItem, { kind: 'timeOff' }>

/** "08–17" for a working-hour chip, minutes kept only when they are not on the hour. */
function shortClock(minutes: number) {
  const clock = clockOf(minutes)
  return clock.endsWith(':00') ? clock.slice(0, 2) : clock
}

/**
 * Desktop month (2026-11-10 redesign): every day cell holds at most three compact lines instead of a stack of items —
 * the working hours (mint), how many visits (forest) and time off (striped). Working hours and time off open their
 * details; the visit line and the day number open the day in the week view.
 */
export function MonthGrid({
  month,
  today,
  items,
  onSelect,
  onDay
}: {
  month: string
  today: string
  items: CalendarItem[]
  onSelect: (item: CalendarItem) => void
  onDay: (day: string) => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const first = weekStart(monthStart(month))
  const grid = Array.from({ length: 42 }, (_, index) => addDays(first, index))
  const days = grid.slice(35).some((day) => monthStart(day) === monthStart(month)) ? grid : grid.slice(0, 35)

  return (
    <div className='overflow-hidden rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-[var(--cg-shadow-1)]'>
      <div className='grid grid-cols-7 border-b border-outline-variant/70 bg-surface-container-low/60 text-center text-xs font-semibold text-on-surface-variant'>
        {WEEKDAYS.map((day) => (
          <span className='py-2' key={day}>
            {t(`caregiver.ui.weekdays.${day}`)}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {days.map((day) => {
          const dayItems = itemsOfDay(items, day)
          const slots = dayItems.filter(
            (item): item is SlotItem => item.kind === 'availability' && item.state !== 'cancelled'
          )
          const visits = dayItems.filter((item): item is VisitItem => item.kind === 'visit')
          const offs = dayItems.filter((item): item is TimeOffItem => item.kind === 'timeOff')
          const outside = monthStart(day) !== monthStart(month)
          const isToday = day === today
          return (
            <div
              className={`flex min-h-28 min-w-0 flex-col gap-1 border-t border-l border-outline-variant/60 p-1.5 [&:nth-child(-n+7)]:border-t-0 [&:nth-child(7n+1)]:border-l-0 ${outside ? 'bg-surface-container-low/50' : ''} ${isToday ? 'bg-mint-50/70' : ''}`}
              key={day}
            >
              <button
                aria-label={t('caregiver.work.calendar.dayLabel', {
                  day: format.shortDay(day),
                  count: dayItems.length
                })}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold tabular-nums hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-primary ${isToday ? 'bg-forest-900 text-white hover:bg-forest-800' : outside ? 'text-on-surface-variant/60' : 'text-on-surface'}`}
                onClick={() => onDay(day)}
                type='button'
              >
                {Number(day.slice(8))}
              </button>
              {slots.length ? (
                <button
                  className='cg-press flex w-full items-center gap-1 truncate rounded-lg bg-mint-100 px-1.5 py-0.5 text-left text-[11px] font-semibold text-forest-900 tabular-nums hover:bg-mint-200 focus-visible:outline-2 focus-visible:outline-primary'
                  onClick={() => onSelect(slots[0])}
                  title={slots.map((slot) => `${clockOf(slot.start)}–${clockOf(slot.end)}`).join(', ')}
                  type='button'
                >
                  <Icon className='shrink-0 text-xs' name='work_history' />
                  <span className='truncate'>
                    {`${shortClock(slots[0].start)}–${shortClock(slots[0].end)}`}
                    {slots.length > 1 ? ` +${slots.length - 1}` : ''}
                  </span>
                </button>
              ) : null}
              {visits.length ? (
                <button
                  className='cg-press flex w-full items-center gap-1 truncate rounded-lg bg-forest-900 px-1.5 py-0.5 text-left text-[11px] font-semibold text-white hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900'
                  onClick={() => (visits.length === 1 ? onSelect(visits[0]) : onDay(day))}
                  type='button'
                >
                  <Icon className='shrink-0 text-xs' name='assignment_ind' />
                  <span className='truncate'>
                    {visits.length === 1
                      ? `${clockOf(visits[0].start)} ${visits[0].visit.recipientName ?? ''}`.trim()
                      : t('caregiver.work.calendar.visitCount', { count: visits.length })}
                  </span>
                </button>
              ) : null}
              {offs.length ? (
                <button
                  className={`cg-press flex w-full items-center gap-1 truncate rounded-lg border border-outline-variant px-1.5 py-0.5 text-left text-[11px] font-semibold text-on-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${TIME_OFF_STRIPES}`}
                  onClick={() => onSelect(offs[0])}
                  type='button'
                >
                  <Icon className='shrink-0 text-xs' name='beach_access' />
                  <span className='truncate'>
                    {offs[0].allDay
                      ? t('caregiver.work.timeOff.allDay')
                      : `${clockOf(offs[0].start)}–${clockOf(offs[0].end)}`}
                  </span>
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
