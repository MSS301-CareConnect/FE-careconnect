import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { addDays, useCaregiverFormat } from '../../ui/caregiver-format'
import { clockOf, itemsOfDay, type CalendarItem } from './calendar-model'
import { TIME_OFF_STRIPES } from './calendar-item-style'

type SlotItem = Extract<CalendarItem, { kind: 'availability' }>
type VisitItem = Extract<CalendarItem, { kind: 'visit' }>
type TimeOffItem = Extract<CalendarItem, { kind: 'timeOff' }>

const DEFAULT_FIRST_HOUR = 6
const DEFAULT_LAST_HOUR = 22

/**
 * Desktop week (2026-11-10 redesign): seven day columns that list what the day holds instead of stretching blocks down
 * an hour grid. Each column starts with a small hour ribbon (working hours mint, visits forest, time off striped) so
 * the shape of the day reads at a glance, then the working-hour chips, the visits and the time off as compact cards.
 */
export function WeekGrid({
  weekStart,
  today,
  items,
  onSelect
}: {
  weekStart: string
  today: string
  items: CalendarItem[]
  onSelect: (item: CalendarItem) => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const timed = items.filter((item) => !(item.kind === 'timeOff' && item.allDay))
  const firstHour = Math.min(DEFAULT_FIRST_HOUR, ...timed.map((item) => Math.floor(item.start / 60)))
  const lastHour = Math.max(DEFAULT_LAST_HOUR, ...timed.map((item) => Math.ceil(item.end / 60)))
  const span = (lastHour - firstHour) * 60
  const left = (minutes: number) => `${Math.max(0, ((minutes - firstHour * 60) / span) * 100)}%`
  const width = (start: number, end: number) =>
    `${Math.max(2, ((Math.min(end, lastHour * 60) - Math.max(start, firstHour * 60)) / span) * 100)}%`

  return (
    <div className='grid grid-cols-7 gap-2'>
      {days.map((day) => {
        const dayItems = itemsOfDay(items, day)
        const slots = dayItems.filter((item): item is SlotItem => item.kind === 'availability')
        const visits = dayItems.filter((item): item is VisitItem => item.kind === 'visit')
        const offs = dayItems.filter((item): item is TimeOffItem => item.kind === 'timeOff')
        const isToday = day === today
        return (
          <section
            aria-label={t('caregiver.work.calendar.dayLabel', { day: format.shortDay(day), count: dayItems.length })}
            className={`flex min-h-[360px] min-w-0 flex-col rounded-2xl border ${isToday ? 'border-forest-800/25 bg-mint-50/70 shadow-[var(--cg-shadow-1)]' : 'border-outline-variant/70 bg-surface-container-lowest'}`}
            key={day}
          >
            <header className='flex items-center justify-between gap-1 px-2.5 pt-2.5'>
              <span className='flex items-baseline gap-1.5'>
                <span className={`text-xs font-semibold ${isToday ? 'text-forest-800' : 'text-on-surface-variant'}`}>
                  {format.weekday(day)}
                </span>
                <span
                  className={`grid h-8 min-w-8 place-items-center rounded-full px-1 text-base font-bold tabular-nums ${isToday ? 'bg-forest-900 text-white' : 'text-on-surface'}`}
                >
                  {Number(day.slice(8))}
                </span>
              </span>
              {visits.length ? (
                <span className='rounded-full bg-forest-900/90 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums'>
                  {t('caregiver.work.calendar.visitCount', { count: visits.length })}
                </span>
              ) : null}
            </header>

            <div
              aria-hidden='true'
              className='relative mx-2.5 mt-2 h-2 overflow-hidden rounded-full bg-surface-container'
            >
              {offs.map((item) => (
                <span
                  className={`absolute inset-y-0 ${TIME_OFF_STRIPES}`}
                  key={item.id}
                  style={{ left: left(item.start), width: width(item.start, item.end) }}
                />
              ))}
              {slots
                .filter((item) => item.state !== 'cancelled')
                .map((item) => (
                  <span
                    className='absolute inset-y-0 bg-mint-300'
                    key={item.id}
                    style={{ left: left(item.start), width: width(item.start, item.end) }}
                  />
                ))}
              {visits.map((item) => (
                <span
                  className='absolute inset-y-0 bg-forest-800'
                  key={item.id}
                  style={{ left: left(item.start), width: width(item.start, item.end) }}
                />
              ))}
            </div>
            <div
              aria-hidden='true'
              className='mx-2.5 mt-0.5 flex justify-between text-[9px] text-on-surface-variant/70 tabular-nums'
            >
              <span>{clockOf(firstHour * 60).slice(0, 2)}</span>
              <span>{clockOf(lastHour * 60).slice(0, 2)}</span>
            </div>

            <div className='flex flex-1 flex-col gap-1.5 p-2'>
              {offs.map((item) => (
                <button
                  className={`cg-press flex w-full items-center gap-1.5 rounded-xl border border-outline-variant px-2 py-1.5 text-left text-[11px] font-semibold text-on-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${TIME_OFF_STRIPES}`}
                  key={item.id}
                  onClick={() => onSelect(item)}
                  type='button'
                >
                  <Icon className='shrink-0 text-sm' name='beach_access' />
                  <span className='truncate'>
                    {item.allDay ? t('caregiver.work.timeOff.allDay') : `${clockOf(item.start)}–${clockOf(item.end)}`}
                  </span>
                </button>
              ))}
              {slots.map((item) => (
                <button
                  className={`cg-press flex w-full flex-col rounded-xl px-2 py-1.5 text-left text-[11px] leading-tight focus-visible:outline-2 focus-visible:outline-primary ${item.state === 'open' ? 'bg-mint-100 text-forest-900 hover:bg-mint-200' : 'border border-dashed border-outline-variant text-on-surface-variant'} ${item.state === 'cancelled' ? 'line-through' : ''}`}
                  key={item.id}
                  onClick={() => onSelect(item)}
                  type='button'
                >
                  <span className='flex items-center gap-1 font-bold tabular-nums'>
                    <Icon className='shrink-0 text-sm' name='work_history' />
                    {`${clockOf(item.start)}–${clockOf(item.end)}`}
                  </span>
                  <span className='truncate opacity-80'>{t('caregiver.work.calendar.layers.availability')}</span>
                </button>
              ))}
              {visits.map((item) => (
                <button
                  className='cg-press flex w-full flex-col rounded-xl bg-forest-900 px-2 py-1.5 text-left text-[11px] leading-tight text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900'
                  key={item.id}
                  onClick={() => onSelect(item)}
                  type='button'
                >
                  <span className='font-bold tabular-nums'>{`${clockOf(item.start)}–${clockOf(item.end)}`}</span>
                  <span className='truncate text-white/85'>
                    {item.visit.recipientName ?? t('caregiver.work.calendar.layers.visit')}
                  </span>
                  {item.visit.services?.[0]?.serviceName ? (
                    <span className='truncate text-mint-200'>{item.visit.services[0].serviceName}</span>
                  ) : null}
                </button>
              ))}
              {dayItems.length === 0 ? (
                <span className='m-auto text-xs text-on-surface-variant/60'>{t('caregiver.work.calendar.free')}</span>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
