import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'

import { calendarDayOf } from '../ui/caregiver-format'

// BookingService caregiver-withdrawal-lead: only visits starting later than this can be withdrawn.
export const WITHDRAWAL_LEAD_MS = 24 * 60 * 60_000
// BookingService accepts at most 60 visits per withdrawal request.
const MAX_VISITS_PER_REQUEST = 60

/** A visit still in the caregiver's hands: assigned (confirmed or not), not started and not already withdrawn. */
export function isOwnWorkable(visit: CaregiverOccurrenceRecord) {
  return (visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED') && !visit.needsReassignment
}

/** A visit the caregiver may still withdraw from: still theirs and starting more than 24 h from now. */
export function canWithdraw(visit: CaregiverOccurrenceRecord, now: number) {
  return isOwnWorkable(visit) && new Date(visit.startAt).getTime() - now > WITHDRAWAL_LEAD_MS
}

export type WithdrawScope = 'visit' | 'day' | 'remaining'

/**
 * What withdrawing a day means (2026-11-10, BookingService 5265): a day with several visits is withdrawn whole, so
 * every visit of the day still in the caregiver's hands must qualify; a single-visit day is withdrawn on its own.
 */
export function dayWithdrawal(dayVisits: CaregiverOccurrenceRecord[], now: number) {
  const own = dayVisits.filter(isOwnWorkable)
  return {
    visits: own,
    allowed: own.length > 0 && own.every((visit) => canWithdraw(visit, now)),
    scope: (own.length > 1 ? 'day' : 'visit') as WithdrawScope
  }
}

/** Visits grouped by calendar day (Vietnam time), soonest first. */
export function groupVisitsByDay(visits: CaregiverOccurrenceRecord[]) {
  const days = new Map<string, CaregiverOccurrenceRecord[]>()
  const sorted = [...visits].sort((first, second) => first.startAt.localeCompare(second.startAt))
  for (const visit of sorted) {
    const day = calendarDayOf(visit.startAt)
    days.set(day, [...(days.get(day) ?? []), visit])
  }
  return [...days.entries()].map(([day, items]) => ({ day, visits: items }))
}

/**
 * "Withdraw from the remaining visits": every day that can be withdrawn whole; days with a visit less than 24 hours
 * away stay with the caregiver (listed as kept).
 */
export function remainingWithdrawal(visits: CaregiverOccurrenceRecord[], now: number) {
  const withdrawable: CaregiverOccurrenceRecord[] = []
  const kept: CaregiverOccurrenceRecord[] = []
  for (const group of groupVisitsByDay(visits.filter(isOwnWorkable))) {
    const day = dayWithdrawal(group.visits, now)
    if (day.allowed) withdrawable.push(...day.visits)
    else kept.push(...day.visits)
  }
  return { withdrawable, kept }
}

/** Requests of at most 60 visits that never split a day, so each one satisfies the whole-day rule on its own. */
export function chunkWholeDays(visits: CaregiverOccurrenceRecord[]) {
  const chunks: string[][] = []
  let current: string[] = []
  for (const group of groupVisitsByDay(visits)) {
    const ids = group.visits.map((visit) => visit.id)
    if (current.length && current.length + ids.length > MAX_VISITS_PER_REQUEST) {
      chunks.push(current)
      current = []
    }
    current.push(...ids)
  }
  if (current.length) chunks.push(current)
  return chunks
}
