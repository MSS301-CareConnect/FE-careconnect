import type { BookingStatus, BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { foldText } from '~/shared/lib/fold-text'

/**
 * The bookings list folds the nine BookingService statuses into tabs a family understands. "action" is a cross-cut:
 * a booking awaiting its initial payment, or one whose remaining-balance invoice is still open.
 */
export const BOOKING_GROUPS = ['all', 'action', 'upcoming', 'ongoing', 'done', 'closed'] as const
export type BookingGroup = (typeof BOOKING_GROUPS)[number]

const GROUP_STATUSES: Record<Exclude<BookingGroup, 'all' | 'action'>, readonly BookingStatus[]> = {
  upcoming: ['PENDING_CENTER_CONFIRMATION', 'PENDING_CAREGIVER_ASSIGNMENT', 'AWAITING_INITIAL_PAYMENT', 'CONFIRMED'],
  ongoing: ['IN_PROGRESS'],
  done: ['COMPLETED'],
  closed: ['REJECTED', 'CANCELLED', 'EXPIRED']
}

export function groupOfStatus(status: BookingStatus): Exclude<BookingGroup, 'all' | 'action'> {
  for (const [group, statuses] of Object.entries(GROUP_STATUSES)) {
    if (statuses.includes(status)) return group as Exclude<BookingGroup, 'all' | 'action'>
  }
  return 'closed'
}

/** What the customer has to do on a booking now, if anything. */
export type BookingAction = 'payDeposit' | 'payRemaining' | null

export function bookingAction(booking: BookingSummaryRecord, openInvoiceBookings: ReadonlySet<string>): BookingAction {
  if (booking.status === 'AWAITING_INITIAL_PAYMENT') return 'payDeposit'
  if (booking.status === 'CONFIRMED' && openInvoiceBookings.has(booking.id)) return 'payRemaining'
  return null
}

export function inGroup(
  booking: BookingSummaryRecord,
  group: BookingGroup,
  openInvoiceBookings: ReadonlySet<string>
): boolean {
  if (group === 'all') return true
  if (group === 'action') return bookingAction(booking, openInvoiceBookings) !== null
  return GROUP_STATUSES[group].includes(booking.status)
}

/** Booking code or the cared-for person's name, ignoring case and diacritics. */
export function matchesKeyword(booking: BookingSummaryRecord, keyword: string) {
  const needle = foldText(keyword.trim())
  if (!needle) return true
  return foldText(`${booking.bookingCode} ${booking.recipientName ?? ''}`).includes(needle)
}

export const BOOKING_SORTS = ['newest', 'startSoonest', 'startLatest'] as const
export type BookingSort = (typeof BOOKING_SORTS)[number]

export function compareBookings(sort: BookingSort) {
  return (first: BookingSummaryRecord, second: BookingSummaryRecord) => {
    if (sort === 'newest') return (second.createdAt ?? '').localeCompare(first.createdAt ?? '')
    const byStart = first.startDate.localeCompare(second.startDate)
    return sort === 'startSoonest' ? byStart : -byStart
  }
}
