import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'

/** Statuses the customer can still cancel from (spec §11); the backend decides the refund. */
export const CANCELLABLE: ReadonlySet<BookingStatus> = new Set([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

/** A RECURRING / CUSTOM booking that is confirmed but still owes its remaining balance before the first visit. */
export function awaitsRemaining(booking: BookingDetailRecord) {
  return booking.status === 'CONFIRMED' && Boolean(booking.remainingPaymentDueAt) && !booking.fullyPaidAt
}

export const LIFECYCLE_STEPS = ['request', 'confirm', 'assign', 'pay', 'upcoming', 'care', 'done'] as const
export type LifecycleStep = (typeof LIFECYCLE_STEPS)[number]

/**
 * The steps a booking goes through. A SHIFT booking is held at once on the caregiver's own shift (2026-11-05), so it
 * has no confirmation or assignment step; a booking with a chosen caregiver is confirmed by that caregiver (CR-3).
 * "upcoming" is the wait between full payment and the first visit, so a paid booking does not read "in care" days early.
 */
export function lifecycleSteps(booking: BookingDetailRecord): readonly LifecycleStep[] {
  return booking.bookingType === 'SHIFT' ? ['request', 'pay', 'upcoming', 'care', 'done'] : LIFECYCLE_STEPS
}

/** Translation key suffix of a step: "confirm" names who confirms. */
export function lifecycleStepLabel(booking: BookingDetailRecord, step: LifecycleStep) {
  if (step === 'request' && booking.bookingType === 'SHIFT') return 'requestHeld' as const
  if (step === 'confirm' && booking.status === 'PENDING_CAREGIVER_CONFIRMATION') return 'confirmCaregiver' as const
  return step
}

/**
 * Where the booking stands on the way from request to last visit, and the deadline of that step. Rejected,
 * cancelled and expired bookings left the way, so they have no position (the status panel explains them).
 */
export function lifecyclePosition(
  booking: BookingDetailRecord
): { current: LifecycleStep | 'finished'; dueAt?: string } | null {
  switch (booking.status) {
    case 'PENDING_CENTER_CONFIRMATION':
    case 'PENDING_CAREGIVER_CONFIRMATION':
      // A SHIFT booking made before 2026-11-05 may still wait on its caregiver; it shows as the request step.
      return { current: booking.bookingType === 'SHIFT' ? 'request' : 'confirm', dueAt: booking.acceptanceDueAt }
    case 'PENDING_CAREGIVER_ASSIGNMENT':
      return { current: 'assign', dueAt: booking.assignmentDueAt }
    case 'AWAITING_INITIAL_PAYMENT':
      return { current: 'pay', dueAt: booking.depositDueAt }
    case 'CONFIRMED': {
      if (awaitsRemaining(booking)) return { current: 'pay', dueAt: booking.remainingPaymentDueAt }
      // Paid: waiting for the first visit until one has started (BookingService moves to IN_PROGRESS on check-in).
      const started = (booking.occurrences ?? []).some((visit) => STARTED.has(visit.status))
      return started ? { current: 'care' } : { current: 'upcoming', dueAt: firstUpcomingVisit(booking) }
    }
    case 'IN_PROGRESS':
      return { current: 'care' }
    case 'COMPLETED':
      return { current: 'finished' }
    default:
      return null
  }
}

const STARTED: ReadonlySet<string> = new Set(['IN_PROGRESS', 'COMPLETED', 'CUSTOMER_NO_SHOW', 'CAREGIVER_MISSED'])

function firstUpcomingVisit(booking: BookingDetailRecord) {
  return (booking.occurrences ?? [])
    .filter((visit) => visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED' || visit.status === 'RESERVED')
    .map((visit) => visit.startAt)
    .sort()[0]
}

/** Whole days, hours and minutes left until an instant; null once it has passed. */
export { timeLeft } from '~/entities/booking/booking-deadline'
