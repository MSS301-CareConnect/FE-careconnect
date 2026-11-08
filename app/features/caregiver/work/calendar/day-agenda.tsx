import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { VisitStatusBadge } from '../../ui/visit-status-badge'
import { clockOf, type CalendarItem } from './calendar-model'
import { itemClass } from './calendar-item-style'

const ICONS = { availability: 'event_available', visit: 'assignment_ind', timeOff: 'beach_access' } as const

/** The items of one day as a list: time, what it is, and its state. Tapping one opens its details. */
export function DayAgenda({
  day,
  items,
  onSelect
}: {
  day: string
  items: CalendarItem[]
  onSelect: (item: CalendarItem) => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()

  if (items.length === 0)
    return (
      <div className={`${cgCard} flex flex-col items-center gap-2 px-5 py-8 text-center`}>
        <Icon className='text-3xl text-on-surface-variant' name='event_busy' />
        <p className='font-semibold text-on-surface'>{t('caregiver.work.calendar.emptyDay')}</p>
        <p className='max-w-xs text-sm text-on-surface-variant'>{t('caregiver.work.calendar.emptyDayHint')}</p>
        <Link
          className='cg-press mt-1 inline-flex min-h-11 items-center rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
          to='/caregiver/work-shifts'
        >
          {t('caregiver.work.calendar.signUp')}
        </Link>
      </div>
    )

  return (
    <ul aria-label={format.weekdayLong(day)} className='cg-stagger flex flex-col gap-2'>
      {items.map((item) => (
        <li key={item.id}>
          <button
            className={`${cgCard} cg-press flex min-h-16 w-full items-center gap-3 p-3 text-left hover:shadow-[var(--cg-shadow-2)] focus-visible:outline-2 focus-visible:outline-primary`}
            onClick={() => onSelect(item)}
            type='button'
          >
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${itemClass(item)}`}>
              <Icon className='text-xl no-underline' name={ICONS[item.kind]} />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block font-semibold text-on-surface tabular-nums'>
                {item.kind === 'timeOff' && item.allDay
                  ? t('caregiver.work.timeOff.allDay')
                  : `${clockOf(item.start)}–${clockOf(item.end)}`}
              </span>
              <span className='block truncate text-sm text-on-surface-variant'>
                {item.kind === 'visit'
                  ? (item.visit.recipientName ?? t('caregiver.work.calendar.layers.visit'))
                  : t(`caregiver.work.calendar.layers.${item.kind}`)}
              </span>
            </span>
            {item.kind === 'visit' ? <VisitStatusBadge status={item.visit.status} /> : null}
            {item.kind === 'availability' ? (
              <span className='text-xs font-semibold text-on-surface-variant'>
                {t(`caregiver.work.calendar.slot.${item.state}`)}
              </span>
            ) : null}
            <Icon className='text-lg text-on-surface-variant' name='chevron_right' />
          </button>
        </li>
      ))}
    </ul>
  )
}
