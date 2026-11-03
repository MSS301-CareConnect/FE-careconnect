import { useTranslation } from 'react-i18next'

import { addDays, monthStart, useCaregiverFormat, weekStart } from '../../ui/caregiver-format'
import { clockOf, itemsOfDay, type CalendarItem } from './calendar-model'
import { itemClass } from './calendar-item-style'

const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const
const SHOWN = 3

/** Desktop month: six weeks of day cells with up to three items each; a day opens its agenda. */
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
  const days = Array.from({ length: 42 }, (_, index) => addDays(first, index))

  return (
    <div className='overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest'>
      <div className='grid grid-cols-7 border-b border-outline-variant text-center text-xs font-medium text-on-surface-variant'>
        {WEEKDAYS.map((day) => (
          <span className='py-2' key={day}>
            {t(`caregiver.ui.weekdays.${day}`)}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {days.map((day) => {
          const dayItems = itemsOfDay(items, day)
          const outside = monthStart(day) !== monthStart(month)
          return (
            <div
              className={`min-h-28 border-t border-l border-outline-variant p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 ${outside ? 'bg-surface-container-low/60' : ''}`}
              key={day}
            >
              <button
                aria-label={t('caregiver.work.calendar.dayLabel', {
                  day: format.shortDay(day),
                  count: dayItems.length
                })}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold tabular-nums hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary ${day === today ? 'bg-primary text-on-primary hover:bg-primary-container' : outside ? 'text-on-surface-variant/70' : 'text-on-surface'}`}
                onClick={() => onDay(day)}
                type='button'
              >
                {Number(day.slice(8))}
              </button>
              <ul className='mt-1 flex flex-col gap-0.5'>
                {dayItems.slice(0, SHOWN).map((item) => (
                  <li key={item.id}>
                    <button
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-primary ${itemClass(item)}`}
                      onClick={() => onSelect(item)}
                      type='button'
                    >
                      {clockOf(item.start)} {t(`caregiver.work.calendar.layers.${item.kind}`)}
                    </button>
                  </li>
                ))}
                {dayItems.length > SHOWN ? (
                  <li>
                    <button
                      className='px-1.5 text-[11px] font-semibold text-primary hover:underline'
                      onClick={() => onDay(day)}
                      type='button'
                    >
                      {t('caregiver.work.calendar.more', { count: dayItems.length - SHOWN })}
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
