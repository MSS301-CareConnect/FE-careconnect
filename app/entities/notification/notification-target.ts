import type { NotificationRecord, NotificationType } from '~/shared/api/generated/contracts'

/** The four web portals; each opens a notification on its own pages. */
export type NotificationPortal = 'customer' | 'center-manager' | 'caregiver' | 'admin'

export function notificationsPath(portal: NotificationPortal) {
  return `/${portal}/notifications`
}

/**
 * Where a notification leads in a portal, from its ref (BookingService resolves `bookingId` / `occurrenceId` for refs
 * inside a booking: visits, care sessions, reports, complaints, reviews). Undefined when there is nothing to open.
 */
export function notificationTarget(
  item: Pick<NotificationRecord, 'type' | 'refType' | 'refId' | 'bookingId' | 'occurrenceId'>,
  portal: NotificationPortal
): string | undefined {
  const { type, refType, refId, bookingId, occurrenceId } = item
  switch (portal) {
    case 'customer':
      if (refType === 'MANAGER_INVITATION' || type === 'RECIPIENT_INVITATION') return '/customer/invitations'
      if (type === 'PAYMENT_SUCCEEDED' || type === 'REFUND_COMPLETED' || type === 'REMAINING_OVERDUE')
        return bookingId ? `/customer/bookings/${bookingId}` : '/customer/payments'
      return bookingId ? `/customer/bookings/${bookingId}` : undefined
    case 'center-manager':
      if (type === 'CAREGIVER_ABSENCE_UPDATED') return '/center-manager/bookings'
      if (refType === 'COMPLAINT' || type === 'COMPLAINT_UPDATED') return '/center-manager/complaints'
      if (refType === 'CARE_CENTER') return '/center-manager'
      return bookingId ? `/center-manager/bookings/${bookingId}` : undefined
    case 'caregiver':
      if (type === 'CAREGIVER_REQUEST') return '/caregiver/requests'
      if (type === 'CAREGIVER_ABSENCE_UPDATED') return '/caregiver/visits'
      if (occurrenceId) return `/caregiver/visits/${occurrenceId}`
      if (type === 'REVIEW_CREATED' || type === 'REVIEW_REPLIED') return '/caregiver/profile'
      return bookingId ? '/caregiver/visits' : undefined
    case 'admin':
      if (refType === 'COMPLAINT' || type === 'COMPLAINT_UPDATED') return '/admin/reviews-complaints'
      if (refType === 'BOOKING_OUTBOX' || type === 'OUTBOX_FAILED') return '/admin/incidents'
      if (refType === 'CARE_CENTER' && refId) return `/admin/centers/${refId}`
      return bookingId ? `/admin/bookings/${bookingId}` : undefined
  }
}

/** An icon per kind of notification; anything else uses the bell. */
export function notificationIcon(type: NotificationType) {
  if (type === 'CAREGIVER_ASSIGNED' || type === 'CAREGIVER_REQUEST') return 'assignment_ind'
  if (type === 'CAREGIVER_UNASSIGNED' || type === 'OCCURRENCE_CANCELLED' || type === 'BOOKING_CANCELLED')
    return 'event_busy'
  if (type === 'BOOKING_EXPIRED') return 'timer_off'
  if (type === 'CENTER_ACTION_DUE' || type === 'SHIFT_REMINDER' || type === 'REMAINING_DUE') return 'alarm'
  if (type === 'BOOKING_CREATED') return 'pending_actions'
  if (type === 'BOOKING_ACCEPTED' || type === 'BOOKING_CONFIRMED' || type === 'BOOKING_COMPLETED')
    return 'event_available'
  if (type === 'BOOKING_REJECTED') return 'block'
  if (type === 'SESSION_STARTED' || type === 'SESSION_ENDED' || type === 'SESSION_AUTO_CLOSED')
    return 'medical_services'
  if (
    type === 'OCCURRENCE_MISSED' ||
    type === 'NO_SHOW_REPORTED' ||
    type === 'NO_SHOW_AUTO_ACCEPTED' ||
    type === 'CAREGIVER_ABSENCE_UPDATED'
  )
    return 'person_off'
  if (type === 'CHECK_IN_LATE') return 'alarm'
  if (type === 'REVIEW_CREATED' || type === 'REVIEW_REPLIED') return 'star'
  if (type === 'PAYMENT_SUCCEEDED' || type === 'REFUND_COMPLETED' || type === 'REMAINING_OVERDUE') return 'payments'
  if (type === 'COMPLAINT_UPDATED') return 'report'
  if (type === 'REPORT_SUBMITTED') return 'description'
  if (type === 'BOOKING_ADDRESS_CHANGED') return 'home_pin'
  if (type === 'RECIPIENT_INVITATION') return 'mail'
  if (type === 'OUTBOX_FAILED') return 'sync_problem'
  return 'notifications'
}

export type NotificationTone = 'danger' | 'warning' | 'success' | 'info'

/** Colour family of a notification's icon: problems, things due, good news, everything else. */
export function notificationTone(type: NotificationType): NotificationTone {
  switch (type) {
    case 'BOOKING_EXPIRED':
    case 'BOOKING_CANCELLED':
    case 'BOOKING_REJECTED':
    case 'OCCURRENCE_CANCELLED':
    case 'OCCURRENCE_MISSED':
    case 'CAREGIVER_UNASSIGNED':
    case 'OUTBOX_FAILED':
    case 'REMAINING_OVERDUE':
      return 'danger'
    case 'CENTER_ACTION_DUE':
    case 'REMAINING_DUE':
    case 'SHIFT_REMINDER':
    case 'NO_SHOW_REPORTED':
    case 'CAREGIVER_REQUEST':
    case 'CHECK_IN_LATE':
    case 'CAREGIVER_ABSENCE_UPDATED':
      return 'warning'
    case 'BOOKING_ACCEPTED':
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_COMPLETED':
    case 'PAYMENT_SUCCEEDED':
    case 'REFUND_COMPLETED':
    case 'CAREGIVER_ASSIGNED':
      return 'success'
    default:
      return 'info'
  }
}
