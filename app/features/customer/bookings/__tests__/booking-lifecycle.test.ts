import { describe, expect, it } from 'vitest'

import type { BookingDetailRecord } from '~/shared/api/generated/contracts'

import { lifecyclePosition, timeLeft } from '../booking-lifecycle'

function booking(overrides: Partial<BookingDetailRecord>): BookingDetailRecord {
  return {
    id: 'bk-1',
    bookingCode: 'BK0001',
    status: 'PENDING_CENTER_CONFIRMATION',
    recipientId: 'rc-1',
    centerId: 'ct-1',
    bookingType: 'RECURRING',
    startDate: '2026-11-05',
    ...overrides
  }
}

describe('booking lifecycle', () => {
  it('places each status on the way with the deadline of its step', () => {
    expect(lifecyclePosition(booking({ acceptanceDueAt: '2026-11-04T01:00:00Z' }))).toEqual({
      current: 'confirm',
      dueAt: '2026-11-04T01:00:00Z'
    })
    expect(lifecyclePosition(booking({ status: 'AWAITING_INITIAL_PAYMENT', depositDueAt: 'D' }))).toEqual({
      current: 'pay',
      dueAt: 'D'
    })
    expect(lifecyclePosition(booking({ status: 'COMPLETED' }))).toEqual({ current: 'finished' })
    expect(lifecyclePosition(booking({ status: 'CANCELLED' }))).toBeNull()
  })

  it('keeps a confirmed booking on payment until the remaining balance is paid, then shows the first visit', () => {
    const confirmed = booking({ status: 'CONFIRMED', remainingPaymentDueAt: 'R' })
    expect(lifecyclePosition(confirmed)).toEqual({ current: 'pay', dueAt: 'R' })
    expect(
      lifecyclePosition({
        ...confirmed,
        fullyPaidAt: 'P',
        occurrences: [
          { id: 'o2', occurrenceNo: 2, startAt: '2026-11-06T01:00:00Z', endAt: 'x', status: 'SCHEDULED' },
          { id: 'o1', occurrenceNo: 1, startAt: '2026-11-05T01:00:00Z', endAt: 'x', status: 'SCHEDULED' }
        ]
      })
    ).toEqual({ current: 'care', dueAt: '2026-11-05T01:00:00Z' })
  })

  it('counts down in days, hours and minutes and stops once the deadline passed', () => {
    const now = Date.parse('2026-11-03T00:00:00Z')
    expect(timeLeft('2026-11-04T03:30:00Z', now)).toEqual({ days: 1, hours: 3, minutes: 30 })
    expect(timeLeft('2026-11-03T00:20:00Z', now)).toEqual({ days: 0, hours: 0, minutes: 20 })
    expect(timeLeft('2026-11-02T23:00:00Z', now)).toBeNull()
  })
})
