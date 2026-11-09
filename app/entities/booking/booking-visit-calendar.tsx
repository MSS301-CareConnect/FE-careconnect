import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import type { StatusTone } from '~/shared/ui/status-badge'

import { monthGrid, shiftMonth } from './booking-month'
import { OCCURRENCE_STATUS_TONES } from './booking-status-badge'
import type { ScheduleVisit } from './booking-visit-table'

const VISIBLE_PER_DAY = 3
const CHIP: Record<StatusTone, string> = {
  success: 'bg-success-container text-on-success-container',
  active: 'bg-active-container text-on-active-container',
  info: 'bg-info-container text-on-info-container',
  warning: 'bg-warning-container text-on-warning-container',
  caution: 'bg-caution-container text-on-caution-container',
  danger: 'bg-error-container text-on-error-container',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-neutral-container text-on-neutral-container line-through'
}

/**
 * The visits of one booking on a month grid (2026-11-09): each day lists its visits as time chips coloured by status;
 * a chip opens the visit. Opens on the month of the next visit and only moves between months that have visits. Phones
 * get the days that have visits as a list.
 */
export function BookingVisitCalendar({
  visits,
  today,
  onSelect
}: {
  visits: ScheduleVisit[]
  today: string
  onSelect?: (occurrence: BookingOccurrenceRecord) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const byDay = new Map<string, ScheduleVisit[]>()
  for (const visit of visits) {
    const day = calendarDayOf(visit.startAt)
    byDay.set(day, [...(byDay.get(day) ?? []), visit])
  }
  const months = [...new Set([...byDay.keys()].map((day) => day.slice(0, 7)))].sort()
  const nextVisit = [...byDay.keys()].sort().find((day) => day >= today)
  const [month, setMonth] = useState(() => (nextVisit ?? [...byDay.keys()].sort()[0] ?? today).slice(0, 7))
  const grid = monthGrid(month)
  const [year, monthNumber] = month.split('-')
  const daysWithVisits = grid.filter((day) => day.startsWith(month) && byDay.has(day))

  function chip(visit: ScheduleVisit, number: number) {
    const status = visit.occurrence?.status
    const tone = status ? OCCURRENCE_STATUS_TONES[status] : 'info'
    const label = t('bookingSchedule.calendar.visit', {
      number,
      time: t('bookingSchedule.timeRange', { start: format.clock(visit.startAt), end: format.clock(visit.endAt) }),
      status: status ? t(`booking.occurrenceStatus.${status}`) : ''
    })
    const className = `flex w-full min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-left text-xs font-semibold tabular-nums ${CHIP[tone]}`
    return onSelect && visit.occurrence ? (
      <button
        aria-label={label}
        className={`${className} transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary`}
        key={visit.id}
        onClick={() => visit.occurrence && onSelect(visit.occurrence)}
        type='button'
      >
        <span className='truncate'>
          {format.clock(visit.startAt)}–{format.clock(visit.endAt)}
        </span>
      </button>
    ) : (
      <span aria-label={label} className={className} key={visit.id}>
        <span className='truncate'>
          {format.clock(visit.startAt)}–{format.clock(visit.endAt)}
        </span>
      </span>
    )
  }

  const numberOf = (visit: ScheduleVisit) => visit.occurrenceNo ?? visits.indexOf(visit) + 1

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <button
          aria-label={t('bookingSchedule.calendar.previous')}
          className='grid h-10 w-10 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary'
          disabled={!months.length || month <= months[0]}
          onClick={() => setMonth((current) => shiftMonth(current, -1))}
          type='button'
        >
          <Icon className='text-xl' name='chevron_left' />
        </button>
        <h3 aria-live='polite' className='text-sm font-bold text-on-surface'>
          {t('bookingSchedule.calendar.month', { month: monthNumber, year })}
        </h3>
        <button
          aria-label={t('bookingSchedule.calendar.next')}
          className='grid h-10 w-10 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary'
          disabled={!months.length || month >= months[months.length - 1]}
          onClick={() => setMonth((current) => shiftMonth(current, 1))}
          type='button'
        >
          <Icon className='text-xl' name='chevron_right' />
        </button>
      </div>

      <div className='hidden overflow-hidden rounded-xl border border-outline-variant/60 md:block'>
        <div className='grid grid-cols-7 border-b border-outline-variant/40 bg-surface-container-low'>
          {grid.slice(0, 7).map((day) => (
            <div className='px-2 py-2 text-xs font-semibold text-on-surface-variant' key={day}>
              {format.weekday(day)}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7'>
          {grid.map((day) => {
            const inMonth = day.startsWith(month)
            const items = inMonth ? (byDay.get(day) ?? []) : []
            return (
              <div
                className={`min-h-24 border-r border-b border-outline-variant/30 p-1.5 [&:nth-child(7n)]:border-r-0 ${inMonth ? 'bg-surface-container-lowest' : 'bg-surface-container-low/50'}`}
                key={day}
              >
                <span
                  className={`mb-1 grid h-6 min-w-6 place-items-center justify-self-start rounded-full px-1 text-xs font-semibold tabular-nums ${day === today ? 'bg-primary text-on-primary' : inMonth ? 'text-on-surface' : 'text-outline'}`}
                >
                  {Number(day.slice(8))}
                </span>
                <div className='flex flex-col gap-0.5'>
                  {items.slice(0, VISIBLE_PER_DAY).map((visit) => chip(visit, numberOf(visit)))}
                  {items.length > VISIBLE_PER_DAY ? (
                    <span className='px-1.5 text-xs font-semibold text-on-surface-variant'>
                      {t('bookingSchedule.calendar.more', { count: items.length - VISIBLE_PER_DAY })}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='flex flex-col gap-2 md:hidden'>
        {daysWithVisits.length === 0 ? (
          <p className='rounded-xl border border-outline-variant/60 p-4 text-sm text-on-surface-variant'>
            {t('bookingSchedule.calendar.empty')}
          </p>
        ) : (
          daysWithVisits.map((day) => (
            <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3' key={day}>
              <h4 className={`text-sm font-bold ${day === today ? 'text-primary' : 'text-on-surface'}`}>
                {format.longDayLabel(day)}
              </h4>
              <div className='mt-1.5 flex flex-wrap gap-1.5'>
                {(byDay.get(day) ?? []).map((visit) => (
                  <div className='min-w-28' key={visit.id}>
                    {chip(visit, numberOf(visit))}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
