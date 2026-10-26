import { describe, expect, it } from 'vitest'

import {
  bookingDay,
  bookingErrorKey,
  formatDay,
  hasStarted,
  isUpcomingOccurrence,
  shortTime,
  weekdayKey
} from './booking-format'

function failure(status: number, code?: number) {
  return Object.assign(new Error('failed'), { status, info: code === undefined ? undefined : { code } })
}

describe('booking format helpers', () => {
  it('maps known BookingService codes to their own message and others by HTTP status', () => {
    expect(bookingErrorKey(failure(409, 5226))).toBe('booking.errors.e5226')
    expect(bookingErrorKey(failure(400, 5214))).toBe('booking.errors.e5214')
    expect(bookingErrorKey(failure(403, 9999))).toBe('booking.errors.forbidden')
    expect(bookingErrorKey(failure(503))).toBe('booking.errors.unavailable')
    expect(bookingErrorKey(new Error('network'))).toBe('booking.errors.generic')
  })

  it('treats only scheduled or acknowledged visits that have not started as upcoming', () => {
    const now = Date.parse('2026-11-01T01:00:00Z')
    expect(isUpcomingOccurrence({ status: 'SCHEDULED', startAt: '2026-11-01T02:00:00Z' }, now)).toBe(true)
    expect(isUpcomingOccurrence({ status: 'ACKNOWLEDGED', startAt: '2026-11-01T00:30:00Z' }, now)).toBe(false)
    expect(isUpcomingOccurrence({ status: 'CANCELLED', startAt: '2026-11-01T02:00:00Z' }, now)).toBe(false)
    expect(hasStarted('2026-11-01T00:30:00Z', now)).toBe(true)
  })

  it('keeps calendar dates and times in Vietnam time without browser shifts', () => {
    expect(formatDay('2026-11-01', 'vi')).toBe('01/11/2026')
    // 17:30 UTC is already the next day in Vietnam (UTC+7).
    expect(bookingDay(new Date('2026-10-31T17:30:00Z'))).toBe('2026-11-01')
    expect(shortTime('08:00:00')).toBe('08:00')
    expect(weekdayKey(7)).toBe('7')
    expect(weekdayKey(8)).toBeUndefined()
  })
})
