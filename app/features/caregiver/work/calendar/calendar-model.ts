import type {
  CaregiverOccurrenceRecord,
  ProviderScheduleRecord,
  ProviderTimeOffRecord
} from '~/shared/api/generated/contracts'
import { formatClock24 } from '~/shared/lib/format'

import { CANCELLED_VISIT_STATUSES } from '../../data/caregiver-queries'
import { addDays, calendarDayOf, hhmm } from '../../ui/caregiver-format'

export type SlotState = 'open' | 'past' | 'cancelled'

interface Base {
  id: string
  day: string
  /** Minutes from midnight. */
  start: number
  end: number
}

export type CalendarItem =
  | (Base & { kind: 'availability'; slot: ProviderScheduleRecord; state: SlotState })
  | (Base & { kind: 'visit'; visit: CaregiverOccurrenceRecord })
  | (Base & { kind: 'timeOff'; record: ProviderTimeOffRecord; allDay: boolean })

const DAY_MINUTES = 24 * 60

function minutesOfTime(time: string) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
}

function minutesOfInstant(value: string) {
  return minutesOfTime(formatClock24(value, 'vi'))
}

/** "08:00" from minutes after midnight. */
export function clockOf(minutes: number) {
  const value = Math.min(minutes, DAY_MINUTES)
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

export function slotState(slot: ProviderScheduleRecord, now: number): SlotState {
  if (slot.scheduleStatus === 'CANCELLED') return 'cancelled'
  return new Date(`${slot.workDate}T${slot.endTime}`).getTime() <= now ? 'past' : 'open'
}

/**
 * Availability slots, assigned visits and time off of the days `from`–`to`, one item per day they touch. A time off
 * over several days becomes one item per day, whole days marked `allDay`.
 */
export function buildCalendarItems({
  from,
  to,
  slots,
  visits,
  timeOffs,
  now
}: {
  from: string
  to: string
  slots: ProviderScheduleRecord[]
  visits: CaregiverOccurrenceRecord[]
  timeOffs: ProviderTimeOffRecord[]
  now: number
}): CalendarItem[] {
  const items: CalendarItem[] = []
  for (const slot of slots) {
    if (slot.workDate < from || slot.workDate > to) continue
    items.push({
      kind: 'availability',
      id: `slot-${slot.id}`,
      day: slot.workDate,
      start: minutesOfTime(hhmm(slot.startTime)),
      end: minutesOfTime(hhmm(slot.endTime)) || DAY_MINUTES,
      slot,
      state: slotState(slot, now)
    })
  }
  for (const visit of visits) {
    if (CANCELLED_VISIT_STATUSES.has(visit.status)) continue
    const day = calendarDayOf(visit.startAt)
    if (day < from || day > to) continue
    const sameDay = calendarDayOf(visit.endAt) === day
    items.push({
      kind: 'visit',
      id: `visit-${visit.id}`,
      day,
      start: minutesOfInstant(visit.startAt),
      end: sameDay ? minutesOfInstant(visit.endAt) : DAY_MINUTES,
      visit
    })
  }
  for (const record of timeOffs) {
    const first = calendarDayOf(record.startAt)
    const last = calendarDayOf(record.endAt)
    for (let day = first < from ? from : first; day <= last && day <= to; day = addDays(day, 1)) {
      const start = day === first ? minutesOfInstant(record.startAt) : 0
      const end = day === last ? minutesOfInstant(record.endAt) : DAY_MINUTES
      if (end <= start) continue
      items.push({
        kind: 'timeOff',
        id: `off-${record.id}-${day}`,
        day,
        start,
        end,
        record,
        allDay: start === 0 && end === DAY_MINUTES
      })
    }
  }
  return items.sort((first, second) => first.day.localeCompare(second.day) || first.start - second.start)
}

export function itemsOfDay(items: CalendarItem[], day: string) {
  return items.filter((item) => item.day === day)
}
