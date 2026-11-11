import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { addDays, monthStart, useCaregiverFormat, weekStart } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { groupVisitsByDay } from '../withdraw-model'
import { BookingDaySection, type DayActions } from './booking-day-section'

const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const

export type DayState = 'toAccept' | 'replacing' | 'inProgress' | 'upcoming' | 'missed' | 'done' | 'cancelled'

/** One state per day, the one that needs the caregiver most. */
export function dayState(visits: CaregiverOccurrenceRecord[]): DayState {
  const has = (test: (visit: CaregiverOccurrenceRecord) => boolean) => visits.some(test)
  if (has((visit) => visit.status === 'SCHEDULED' && !visit.needsReassignment)) return 'toAccept'
  if (has((visit) => Boolean(visit.needsReassignment))) return 'replacing'
  if (has((visit) => visit.status === 'IN_PROGRESS')) return 'inProgress'
  if (has((visit) => visit.status === 'ACKNOWLEDGED')) return 'upcoming'
  if (has((visit) => visit.status === 'CAREGIVER_MISSED')) return 'missed'
  if (has((visit) => visit.status === 'COMPLETED' || visit.status === 'CUSTOMER_NO_SHOW')) return 'done'
  return 'cancelled'
}

export const DAY_STATE_STYLE: Record<DayState, { chip: string; dot: string }> = {
  toAccept: { chip: 'bg-peach-100 text-peach-700 ring-peach-200', dot: 'bg-peach-400' },
  replacing: { chip: 'bg-caution-container text-on-caution-container ring-caution/30', dot: 'bg-caution' },
  inProgress: { chip: 'bg-mint-300 text-forest-950 ring-mint-400', dot: 'bg-mint-500' },
  upcoming: { chip: 'bg-forest-900 text-white ring-forest-900', dot: 'bg-forest-900' },
  missed: { chip: 'bg-error-container text-on-error-container ring-error/30', dot: 'bg-error' },
  done: { chip: 'bg-mint-100 text-forest-800 ring-mint-200', dot: 'bg-mint-300' },
  cancelled: {
    chip: 'bg-surface-container text-on-surface-variant line-through ring-outline-variant',
    dot: 'bg-outline'
  }
}

function shiftMonth(day: string, amount: number) {
  const date = new Date(`${monthStart(day)}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 10)
}

const navButton =
  'cg-press grid h-10 w-10 place-items-center rounded-full border border-forest-900/10 bg-white text-forest-900 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-forest-900 disabled:opacity-40'

/**
 * The booking as a month calendar (2026-11-10): each day with visits shows one summary chip for the booking — how many
 * visits and from when to when, coloured by what the day needs — instead of every visit. Picking a day opens its
 * visits below (beside on wide screens) with the same day actions as the day list.
 */
export function BookingMonthView({
  visits,
  today,
  now,
  actions
}: {
  visits: CaregiverOccurrenceRecord[]
  today: string
  now: number
  actions: DayActions
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const days = groupVisitsByDay(visits)
  const byDay = new Map(days.map((group) => [group.day, group.visits]))
  const firstMonth = monthStart(days[0]?.day ?? today)
  const lastMonth = monthStart(days.at(-1)?.day ?? today)
  const initialDay = days.find((group) => group.day >= today)?.day ?? days.at(-1)?.day ?? today
  const [month, setMonth] = useState(monthStart(initialDay))
  const [selected, setSelected] = useState(initialDay)
  const grid = Array.from({ length: 42 }, (_, index) => addDays(weekStart(month), index))
  const lastRowNeeded = grid.slice(35).some((day) => monthStart(day) === month)
  const cells = lastRowNeeded ? grid : grid.slice(0, 35)
  const selectedVisits = byDay.get(selected) ?? []
  const monthVisits = days.filter((group) => monthStart(group.day) === month)
  const title = new Intl.DateTimeFormat(format.language.startsWith('en') ? 'en-GB' : 'vi-VN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${month}T00:00:00Z`))

  function move(amount: number) {
    const next = shiftMonth(month, amount)
    setMonth(next)
    const firstOfMonth = days.find((group) => monthStart(group.day) === next)
    if (firstOfMonth) setSelected(firstOfMonth.day)
  }

  return (
    <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]'>
      <section aria-labelledby='booking-month-title' className={`${cgCard} overflow-hidden`}>
        <header className='flex items-center justify-between gap-3 px-4 py-3'>
          <div>
            <h2 className='text-base font-semibold text-on-surface capitalize' id='booking-month-title'>
              {title}
            </h2>
            <p className='text-xs text-on-surface-variant'>
              {t('caregiver.booking.calendar.monthSummary', {
                days: monthVisits.length,
                count: monthVisits.reduce((sum, group) => sum + group.visits.length, 0)
              })}
            </p>
          </div>
          <div className='flex items-center gap-1.5'>
            <button
              aria-label={t('caregiver.booking.calendar.previous')}
              className={navButton}
              disabled={month <= firstMonth}
              onClick={() => move(-1)}
              type='button'
            >
              <Icon name='chevron_left' />
            </button>
            <button
              aria-label={t('caregiver.booking.calendar.next')}
              className={navButton}
              disabled={month >= lastMonth}
              onClick={() => move(1)}
              type='button'
            >
              <Icon name='chevron_right' />
            </button>
          </div>
        </header>
        <div className='grid grid-cols-7 border-y border-outline-variant/60 bg-surface-container-low/60 text-center text-[11px] font-semibold text-on-surface-variant'>
          {WEEKDAYS.map((weekday) => (
            <span className='py-2' key={weekday}>
              {t(`caregiver.ui.weekdays.${weekday}`)}
            </span>
          ))}
        </div>
        <div className='grid grid-cols-7'>
          {cells.map((day) => {
            const dayVisits = byDay.get(day) ?? []
            const outside = monthStart(day) !== month
            const isSelected = day === selected
            const state = dayVisits.length ? dayState(dayVisits) : null
            const content = (
              <>
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold tabular-nums ${day === today ? 'bg-forest-900 text-white' : outside ? 'text-on-surface-variant/50' : 'text-on-surface'}`}
                >
                  {Number(day.slice(8))}
                </span>
                {state ? (
                  <>
                    <span
                      className={`mt-1 hidden w-full flex-col rounded-lg px-1.5 py-1 text-left text-[11px] leading-tight ring-1 sm:flex ${DAY_STATE_STYLE[state].chip}`}
                    >
                      <span className='truncate font-bold'>
                        {t('caregiver.booking.calendar.count', { count: dayVisits.length })}
                      </span>
                      <span className='truncate tabular-nums opacity-80'>
                        {format.clockRange(dayVisits[0].startAt, dayVisits[dayVisits.length - 1].endAt)}
                      </span>
                    </span>
                    <span aria-hidden='true' className='mt-1 flex items-center gap-0.5 sm:hidden'>
                      <span className={`h-1.5 w-1.5 rounded-full ${DAY_STATE_STYLE[state].dot}`} />
                      <span className='text-[10px] font-bold text-on-surface-variant tabular-nums'>
                        {dayVisits.length}
                      </span>
                    </span>
                  </>
                ) : null}
              </>
            )
            const cellClass = `flex min-h-16 flex-col items-start border-t border-l border-outline-variant/50 p-1 sm:min-h-24 sm:p-1.5 [&:nth-child(7n+1)]:border-l-0 ${outside ? 'bg-surface-container-low/40' : ''}`
            return state ? (
              <button
                aria-label={t('caregiver.booking.calendar.dayLabel', {
                  day: format.shortDay(day),
                  count: dayVisits.length,
                  state: t(`caregiver.booking.calendar.states.${state}`)
                })}
                aria-pressed={isSelected}
                className={`${cellClass} cg-press text-left transition-colors hover:bg-mint-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-900 ${isSelected ? 'bg-mint-50 shadow-[inset_0_0_0_2px_var(--color-forest-800)]' : ''}`}
                key={day}
                onClick={() => setSelected(day)}
                type='button'
              >
                {content}
              </button>
            ) : (
              <div className={cellClass} key={day}>
                {content}
              </div>
            )
          })}
        </div>
        <ul
          aria-label={t('caregiver.booking.calendar.legend')}
          className='flex flex-wrap gap-x-3 gap-y-1 border-t border-outline-variant/60 px-4 py-2.5 text-xs text-on-surface-variant'
        >
          {(Object.keys(DAY_STATE_STYLE) as DayState[]).map((state) => (
            <li className='flex items-center gap-1.5' key={state}>
              <span aria-hidden='true' className={`h-2.5 w-2.5 rounded-full ${DAY_STATE_STYLE[state].dot}`} />
              {t(`caregiver.booking.calendar.states.${state}`)}
            </li>
          ))}
        </ul>
      </section>

      <div className='xl:sticky xl:top-20'>
        {selectedVisits.length ? (
          <BookingDaySection
            actions={actions}
            day={selected}
            headingLevel='h2'
            now={now}
            today={today}
            visits={selectedVisits}
          />
        ) : (
          <p className='rounded-2xl border border-dashed border-outline-variant bg-white/60 p-5 text-center text-sm text-on-surface-variant'>
            {t('caregiver.booking.calendar.pick')}
          </p>
        )}
      </div>
    </div>
  )
}
