import type { BookingRecurrenceFrequency } from '~/shared/api/generated/contracts'
import { addDays, isoWeekday } from '~/shared/lib/format'

/** BookingService limit on the occurrences of one booking. */
export const MAX_CUSTOM_SLOTS = 60

/** One visit in Vietnam time; each visit has its own date and time range (spec §4). */
export interface CustomSlot {
  date: string
  startTime: string
  endTime: string
  /** The one service done in this visit (2026-11-05); absent while a single service is chosen. */
  careServiceId?: string
}

/**
 * A daily / weekly pattern: the RECURRING booking itself, or the quick add of a CUSTOM booking. The times are the
 * outer range of the visits it built (BookingService still needs them); each service has its own time (2026-11-11).
 */
export interface RecurrenceRule {
  frequency: BookingRecurrenceFrequency
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
}

export interface RuleIssues {
  invalidRange: boolean
  noWeekday: boolean
  noVisits: boolean
}

/** One chosen service in a pattern: done on every day of the pattern at its own time, or left out of it. */
export interface ServiceTime {
  careServiceId: string
  startTime: string
  endTime: string
  enabled: boolean
}

/** Calendar days of a pattern (Vietnam time), capped at a year to keep the preview cheap. */
export function ruleDays(rule: RecurrenceRule) {
  const days: string[] = []
  if (!rule.startDate || !rule.endDate || rule.endDate < rule.startDate) return days
  if (rule.frequency === 'WEEKLY' && rule.daysOfWeek.length === 0) return days
  let day = rule.startDate
  for (let guard = 0; day <= rule.endDate && guard < 370; guard++) {
    if (rule.frequency === 'DAILY' || rule.daysOfWeek.includes(isoWeekday(day))) days.push(day)
    day = addDays(day, 1)
  }
  return days
}

/** The visits a pattern produces: on each day, one visit per service it includes, at that service's time. */
export function slotsFromPattern(rule: RecurrenceRule, times: readonly ServiceTime[]): CustomSlot[] {
  const used = times.filter((time) => time.enabled)
  return sortSlots(
    ruleDays(rule).flatMap((date) =>
      used.map(({ careServiceId, startTime, endTime }) => ({ date, startTime, endTime, careServiceId }))
    )
  )
}

export function ruleIssuesOf(rule: RecurrenceRule): RuleIssues {
  return {
    invalidRange: Boolean(rule.endDate && rule.startDate && rule.endDate < rule.startDate),
    noWeekday: rule.frequency === 'WEEKLY' && rule.daysOfWeek.length === 0,
    noVisits: ruleDays(rule).length === 0
  }
}

const startOf = (slot: CustomSlot) => `${slot.date}T${slot.startTime}`
const endOf = (slot: CustomSlot) => `${slot.date}T${slot.endTime}`
const overlaps = (a: CustomSlot, b: CustomSlot) => startOf(a) < endOf(b) && startOf(b) < endOf(a)
const sortSlots = (slots: CustomSlot[]) => slots.sort((a, b) => startOf(a).localeCompare(startOf(b)))

/** The visits grouped by day (date order, a visit without a date last), each day's visits in time order. */
export function groupDays(slots: readonly CustomSlot[]) {
  const days = new Map<string, number[]>()
  slots.forEach((slot, index) => days.set(slot.date, [...(days.get(slot.date) ?? []), index]))
  return [...days.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([date, indices]) => ({
      date,
      indices: indices.sort((a, b) => slots[a].startTime.localeCompare(slots[b].startTime))
    }))
}

/** Index of the first visit that overlaps an earlier one (half-open ranges, as BookingService checks). */
export function findOverlappingSlot(slots: readonly CustomSlot[]) {
  const ranges = slots
    .map((slot, index) => ({ index, start: startOf(slot), end: endOf(slot) }))
    .filter((range) => range.start < range.end)
    .sort((a, b) => a.start.localeCompare(b.start))
  for (let position = 1; position < ranges.length; position++) {
    if (ranges[position].start < ranges[position - 1].end) return ranges[position].index
  }
  return -1
}

/**
 * Quick add: appends the new visits that do not overlap one already listed, sorted by time, without passing the
 * booking limit. `skipped` counts the visits left out by the limit.
 */
export function mergeSlots(existing: readonly CustomSlot[], incoming: readonly CustomSlot[], max = MAX_CUSTOM_SLOTS) {
  const kept = existing.filter((slot) => slot.date)
  const fresh: CustomSlot[] = []
  for (const slot of incoming) {
    if (slot.endTime <= slot.startTime) continue
    if ([...kept, ...fresh].some((other) => overlaps(slot, other))) continue
    fresh.push(slot)
  }
  const room = Math.max(0, max - existing.length)
  const added = fresh.slice(0, room)
  const slots = sortSlots([...existing.filter((slot) => slot.date), ...added])
  // An empty row the customer had not filled in yet stays at the end.
  return {
    slots: [...slots, ...existing.filter((slot) => !slot.date)].slice(0, max),
    added: added.length,
    skipped: fresh.length - added.length
  }
}

const minutesOf = (slot: CustomSlot) => {
  const [startHour, startMinute] = slot.startTime.split(':').map(Number)
  const [endHour, endMinute] = slot.endTime.split(':').map(Number)
  return endHour * 60 + endMinute - (startHour * 60 + startMinute)
}

/**
 * Per service, the visit length most of its visits share, and the visits that differ from it, so a visit edited by
 * mistake (3 hours among 2-hour visits) is pointed out. Maps the index of each such visit to its service's usual length;
 * a service with fewer than two valid visits, or whose visits are all unique, has no usual length.
 */
export function durationOutliers(slots: readonly CustomSlot[]) {
  const services = new Map<string, number[]>()
  slots.forEach((slot, index) => {
    if (slot.date && minutesOf(slot) > 0) {
      const key = slot.careServiceId ?? ''
      services.set(key, [...(services.get(key) ?? []), index])
    }
  })
  const outliers = new Map<number, number>()
  for (const indices of services.values()) {
    const counts = new Map<number, number>()
    for (const index of indices) counts.set(minutesOf(slots[index]), (counts.get(minutesOf(slots[index])) ?? 0) + 1)
    let usual: number | null = null
    let best = 1
    for (const [minutes, count] of counts) {
      if (count > best || (count === best && usual !== null && minutes < usual)) {
        usual = minutes
        best = count
      }
    }
    if (usual === null) continue
    for (const index of indices) if (minutesOf(slots[index]) !== usual) outliers.set(index, usual)
  }
  return outliers
}
