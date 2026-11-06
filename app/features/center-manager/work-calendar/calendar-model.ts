import { vnInstant } from '~/entities/provider/caregiver-time-offs'
import { minutesOfDay } from '~/entities/provider/work-shift'
import type { ProviderScheduleRecord, ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { addDays, formatClock24 } from '~/shared/lib/format'

/** The part of a time off that falls on one Vietnam-time day: whole day, or "HH:mm"–"HH:mm". */
export interface DayLeave {
  item: ProviderTimeOffRecord
  wholeDay: boolean
  start: string
  end: string
}

export function leaveOnDay(item: ProviderTimeOffRecord, day: string): DayLeave | undefined {
  const dayStart = new Date(vnInstant(day, '00:00')).getTime()
  const dayEnd = new Date(vnInstant(addDays(day, 1), '00:00')).getTime()
  const start = Math.max(dayStart, new Date(item.startAt).getTime())
  const end = Math.min(dayEnd, new Date(item.endAt).getTime())
  if (end <= start) return undefined
  const clock = (value: number) => formatClock24(new Date(value).toISOString(), 'vi')
  return {
    item,
    wholeDay: start === dayStart && end === dayEnd,
    start: clock(start),
    end: end === dayEnd ? '24:00' : clock(end)
  }
}

/** A scheduled shift that overlaps a time off on the same day (the caregiver cannot work it). */
export function clashesWithLeave(schedule: ProviderScheduleRecord, leaves: DayLeave[]) {
  if (schedule.scheduleStatus === 'CANCELLED') return false
  const start = minutesOfDay(schedule.startTime)
  const end = minutesOfDay(schedule.endTime)
  return leaves.some(
    (leave) => minutesOfDay(leave.start) < end && start < (leave.end === '24:00' ? 1440 : minutesOfDay(leave.end))
  )
}

export function scheduleMinutes(schedule: ProviderScheduleRecord) {
  return Math.max(0, minutesOfDay(schedule.endTime) - minutesOfDay(schedule.startTime))
}

export interface CalendarRow {
  caregiverId: string
  name: string
  schedules: ProviderScheduleRecord[]
  timeOffs: ProviderTimeOffRecord[]
}

/**
 * One row per caregiver: everyone in `people` (active caregivers of the center) plus anyone who appears in the week's
 * schedules or time off, sorted by name; with `onlyBusy` only those who have something this week.
 */
export function buildRows(
  people: { id: string; name: string }[],
  schedules: ProviderScheduleRecord[],
  timeOffs: ProviderTimeOffRecord[],
  onlyBusy: boolean,
  unknown: string
): CalendarRow[] {
  const rows = new Map<string, CalendarRow>()
  const row = (id: string, name?: string) => {
    const existing = rows.get(id)
    if (existing) {
      if (name && existing.name === unknown) existing.name = name
      return existing
    }
    const created = { caregiverId: id, name: name || unknown, schedules: [], timeOffs: [] }
    rows.set(id, created)
    return created
  }
  if (!onlyBusy) for (const person of people) row(person.id, person.name)
  for (const schedule of schedules) row(schedule.caregiverId, schedule.caregiverName).schedules.push(schedule)
  for (const item of timeOffs) row(item.caregiverId, item.caregiverName).timeOffs.push(item)
  const names = new Map(people.map((person) => [person.id, person.name]))
  for (const value of rows.values()) if (value.name === unknown) value.name = names.get(value.caregiverId) ?? unknown
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}
