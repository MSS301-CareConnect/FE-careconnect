import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'

/** Statuses the customer can still cancel from (spec §11); the backend decides the refund. */
export const CANCELLABLE: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

/** A RECURRING / CUSTOM booking that is confirmed but still owes its remaining balance before the first visit. */
export function awaitsRemaining(booking: BookingDetailRecord) {
  return booking.status === 'CONFIRMED' && Boolean(booking.remainingPaymentDueAt) && !booking.fullyPaidAt
}

export const LIFECYCLE_STEPS = ['request', 'confirm', 'assign', 'pay', 'care', 'done'] as const
export type LifecycleStep = (typeof LIFECYCLE_STEPS)[number]

/**
 * Where the booking stands on the way from request to last visit, and the deadline of that step. Rejected,
 * cancelled and expired bookings left the way, so they have no position (the status panel explains them).
 */
export function lifecyclePosition(
  booking: BookingDetailRecord
): { current: LifecycleStep | 'finished'; dueAt?: string } | null {
  switch (booking.status) {
    case 'PENDING_CENTER_CONFIRMATION':
      return { current: 'confirm', dueAt: booking.acceptanceDueAt }
    case 'PENDING_CAREGIVER_ASSIGNMENT':
      return { current: 'assign', dueAt: booking.assignmentDueAt }
    case 'AWAITING_INITIAL_PAYMENT':
      return { current: 'pay', dueAt: booking.depositDueAt }
    case 'CONFIRMED':
      return awaitsRemaining(booking)
        ? { current: 'pay', dueAt: booking.remainingPaymentDueAt }
        : { current: 'care', dueAt: firstUpcomingVisit(booking) }
    case 'IN_PROGRESS':
      return { current: 'care' }
    case 'COMPLETED':
      return { current: 'finished' }
    default:
      return null
  }
}

function firstUpcomingVisit(booking: BookingDetailRecord) {
  return (booking.occurrences ?? [])
    .filter((visit) => visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED' || visit.status === 'RESERVED')
    .map((visit) => visit.startAt)
    .sort()[0]
}

/** Whole days, hours and minutes left until an instant; null once it has passed. */
export function timeLeft(dueAt: string, now: number) {
  const minutes = Math.ceil((new Date(dueAt).getTime() - now) / 60_000)
  if (Number.isNaN(minutes) || minutes <= 0) return null
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 }
}
