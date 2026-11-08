import { useTranslation } from 'react-i18next'

import { addDays, useCaregiverFormat } from '../../ui/caregiver-format'
import { clockOf, itemsOfDay, type CalendarItem } from './calendar-model'
import { itemClass } from './calendar-item-style'

const HOUR_PX = 44
const DEFAULT_FIRST_HOUR = 6
const DEFAULT_LAST_HOUR = 22

/** Desktop week: seven day columns over an hour grid, each item placed by its start and end. */
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
  // A whole day off shades its column instead of stretching the hour range to midnight.
  const timed = items.filter((item) => !(item.kind === 'timeOff' && item.allDay))
  const firstHour = Math.min(DEFAULT_FIRST_HOUR, ...timed.map((item) => Math.floor(item.start / 60)))
  const lastHour = Math.max(DEFAULT_LAST_HOUR, ...timed.map((item) => Math.ceil(item.end / 60)))
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index)
  const top = (minutes: number) => ((minutes - firstHour * 60) * HOUR_PX) / 60

  return (
    <div className='overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest'>
      <div className='grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-outline-variant'>
        <span />
        {days.map((day) => (
          <div
            className={`flex flex-col items-center py-2 text-center ${day === today ? 'text-primary' : 'text-on-surface-variant'}`}
            key={day}
          >
            <span className='text-xs font-medium'>{format.weekday(day)}</span>
            <span
              className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full text-base font-semibold tabular-nums ${day === today ? 'bg-primary text-on-primary' : 'text-on-surface'}`}
            >
              {Number(day.slice(8))}
            </span>
          </div>
        ))}
      </div>
      <div className='max-h-[620px] overflow-y-auto'>
        <div className='relative grid grid-cols-[56px_repeat(7,minmax(0,1fr))]'>
          <div aria-hidden='true'>
            {hours.map((hour) => (
              <div
                className='relative text-right text-[11px] text-on-surface-variant tabular-nums'
                key={hour}
                style={{ height: HOUR_PX }}
              >
                <span className='absolute -top-2 right-2'>{hour > firstHour ? clockOf(hour * 60) : ''}</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayItems = itemsOfDay(items, day)
            return (
              <div
                aria-label={t('caregiver.work.calendar.dayLabel', {
                  day: format.shortDay(day),
                  count: dayItems.length
                })}
                className={`relative border-l border-outline-variant ${day === today ? 'bg-brand-50/40' : ''}`}
                key={day}
                role='group'
                style={{ height: hours.length * HOUR_PX }}
              >
                {hours.map((hour) => (
                  <span
                    aria-hidden='true'
                    className='absolute inset-x-0 border-t border-outline-variant/60'
                    key={hour}
                    style={{ top: (hour - firstHour) * HOUR_PX }}
                  />
                ))}
                {dayItems.map((item) => {
                  const allDay = item.kind === 'timeOff' && item.allDay
                  const from = allDay ? 0 : Math.max(top(item.start), 0)
                  const to = allDay ? hours.length * HOUR_PX : Math.min(top(item.end), hours.length * HOUR_PX)
                  const height = Math.max(22, to - from - 2)
                  const inset =
                    item.kind === 'visit'
                      ? 'left-3 right-1 z-20'
                      : item.kind === 'timeOff'
                        ? 'left-0.5 right-0.5 z-10'
                        : 'left-0.5 right-0.5'
                  return (
                    <button
                      className={`cg-press absolute flex flex-col items-start justify-start overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-95 focus-visible:z-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${inset} ${itemClass(item)}`}
                      key={item.id}
                      onClick={() => onSelect(item)}
                      style={{ top: from + 1, height }}
                      type='button'
                    >
                      <span className='block max-w-full truncate font-semibold tabular-nums'>
                        {allDay ? t('caregiver.work.timeOff.allDay') : `${clockOf(item.start)}–${clockOf(item.end)}`}
                      </span>
                      {height > 36 ? (
                        <span className='block max-w-full truncate'>
                          {item.kind === 'visit'
                            ? (item.visit.recipientName ?? t('caregiver.work.calendar.layers.visit'))
                            : t(`caregiver.work.calendar.layers.${item.kind}`)}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
