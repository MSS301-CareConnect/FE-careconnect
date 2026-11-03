import type { BookingRecurrenceFrequency } from '~/shared/api/generated/contracts'
import { addDays, isoWeekday } from '~/shared/lib/format'

/** BookingService limit on the occurrences of one booking. */
export const MAX_CUSTOM_SLOTS = 60

/** One visit in Vietnam time; each visit has its own date and time range (spec §4). */
export interface CustomSlot {
  date: string
  startTime: string
  endTime: string
}

/** A daily / weekly pattern: the RECURRING booking itself, or the quick add of a CUSTOM booking. */
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
  invalidTime: boolean
  noWeekday: boolean
  noVisits: boolean
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

/** The visits a pattern produces, each with the pattern's time range. */
export function slotsFromRule(rule: RecurrenceRule): CustomSlot[] {
  return ruleDays(rule).map((date) => ({ date, startTime: rule.startTime, endTime: rule.endTime }))
}

export function ruleIssuesOf(rule: RecurrenceRule): RuleIssues {
  return {
    invalidRange: Boolean(rule.endDate && rule.startDate && rule.endDate < rule.startDate),
    invalidTime: Boolean(rule.startTime && rule.endTime && rule.endTime <= rule.startTime),
    noWeekday: rule.frequency === 'WEEKLY' && rule.daysOfWeek.length === 0,
    noVisits: ruleDays(rule).length === 0
  }
}

const startOf = (slot: CustomSlot) => `${slot.date}T${slot.startTime}`
const endOf = (slot: CustomSlot) => `${slot.date}T${slot.endTime}`
const overlaps = (a: CustomSlot, b: CustomSlot) => startOf(a) < endOf(b) && startOf(b) < endOf(a)

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
  const slots = [...existing.filter((slot) => slot.date), ...added].sort((a, b) => startOf(a).localeCompare(startOf(b)))
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
 * The visit length most visits share, and the visits that differ from it, so a visit edited by mistake (3 hours among
 * 2-hour visits) is pointed out. No usual length when fewer than two visits are valid or every visit is unique.
 */
export function durationOutliers(slots: readonly CustomSlot[]) {
  const counts = new Map<number, number>()
  for (const slot of slots) {
    const minutes = minutesOf(slot)
    if (slot.date && minutes > 0) counts.set(minutes, (counts.get(minutes) ?? 0) + 1)
  }
  let usual: number | null = null
  let best = 1
  for (const [minutes, count] of counts) {
    if (count > best || (count === best && usual !== null && minutes < usual)) {
      usual = minutes
      best = count
    }
  }
  const outliers = new Set<number>()
  if (usual !== null) {
    slots.forEach((slot, index) => {
      const minutes = minutesOf(slot)
      if (slot.date && minutes > 0 && minutes !== usual) outliers.add(index)
    })
  }
  return { usualMinutes: usual, outliers }
}
