import type { BookingDeadlineType, BookingStatus } from '~/shared/api/generated/contracts'

/** How close a running deadline is: past it, under an hour, under six hours, or further away. */
export type DeadlineUrgency = 'overdue' | 'critical' | 'soon' | 'normal'

const CRITICAL_MS = 60 * 60_000
const SOON_MS = 6 * 60 * 60_000

/** Statuses whose deadline belongs to the center: confirm the request or assign a caregiver. */
export const CENTER_ACTION_STATUSES: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT'
])

/** Statuses whose deadline closes the booking when it passes (BookingService expires it on its next scan). */
export const EXPIRING_STATUSES: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT'
])

export function deadlineUrgency(dueAt: string, now: number): DeadlineUrgency {
  const left = new Date(dueAt).getTime() - now
  if (Number.isNaN(left) || left <= 0) return 'overdue'
  if (left < CRITICAL_MS) return 'critical'
  if (left < SOON_MS) return 'soon'
  return 'normal'
}

/** Days, hours and minutes left before `dueAt` (rounded up to the minute); null once it has passed. */
export function timeLeft(dueAt: string, now: number) {
  const minutes = Math.ceil((new Date(dueAt).getTime() - now) / 60_000)
  if (Number.isNaN(minutes) || minutes <= 0) return null
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 }
}

/**
 * The running deadline of an expiring status that has already passed: the backend has not closed the booking yet,
 * so screens show it as closing and hide the actions it would refuse.
 */
export function isPastDeadline(
  booking: { status: BookingStatus; deadlineAt?: string; deadlineType?: BookingDeadlineType },
  now: number
) {
  return (
    EXPIRING_STATUSES.has(booking.status) &&
    Boolean(booking.deadlineAt) &&
    deadlineUrgency(booking.deadlineAt ?? '', now) === 'overdue'
  )
}
