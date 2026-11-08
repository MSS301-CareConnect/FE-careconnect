import { describe, expect, it } from 'vitest'

import { notificationTarget } from './notification-target'

describe('notificationTarget', () => {
  it('opens the booking of a notification in each portal', () => {
    const item = { type: 'BOOKING_EXPIRED' as const, refType: 'BOOKING', refId: 'bk-1', bookingId: 'bk-1' }
    expect(notificationTarget(item, 'customer')).toBe('/customer/bookings/bk-1')
    expect(notificationTarget(item, 'center-manager')).toBe('/center-manager/bookings/bk-1')
    expect(notificationTarget(item, 'admin')).toBe('/admin/bookings/bk-1')
    expect(notificationTarget(item, 'caregiver')).toBe('/caregiver/visits')
  })

  it('opens the visit for a caregiver and portal pages for other refs', () => {
    expect(
      notificationTarget(
        {
          type: 'SHIFT_REMINDER',
          refType: 'BOOKING_OCCURRENCE',
          refId: 'occ-1',
          bookingId: 'bk-1',
          occurrenceId: 'occ-1'
        },
        'caregiver'
      )
    ).toBe('/caregiver/visits/occ-1')
    expect(notificationTarget({ type: 'CAREGIVER_REQUEST', refType: 'BOOKING', bookingId: 'bk-1' }, 'caregiver')).toBe(
      '/caregiver/requests'
    )
    expect(notificationTarget({ type: 'COMPLAINT_UPDATED', refType: 'COMPLAINT' }, 'center-manager')).toBe(
      '/center-manager/complaints'
    )
    expect(notificationTarget({ type: 'OUTBOX_FAILED', refType: 'BOOKING_OUTBOX' }, 'admin')).toBe('/admin/incidents')
    expect(notificationTarget({ type: 'RECIPIENT_INVITATION', refType: 'MANAGER_INVITATION' }, 'customer')).toBe(
      '/customer/invitations'
    )
    // A report that no longer exists has no booking: nothing to open.
    expect(
      notificationTarget({ type: 'REPORT_SUBMITTED', refType: 'CARE_REPORT', refId: 'r-1' }, 'customer')
    ).toBeUndefined()
  })
})
