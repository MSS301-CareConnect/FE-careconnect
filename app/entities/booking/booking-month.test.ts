import { describe, expect, it } from 'vitest'

import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'

import { isoWeekday, monthGrid, monthRange, planVisits, shiftMonth } from './booking-month'

function booking(overrides: Partial<BookingSummaryRecord>): BookingSummaryRecord {
  return {
    id: 'bk',
    bookingCode: 'BK-1',
    status: 'CONFIRMED',
    scheduleType: 'ONE_TIME',
    startDate: '2026-11-03',
    startTime: '08:00',
    endTime: '10:00',
    ...overrides
  }
}

describe('booking month', () => {
  it('builds a Monday-first 6-week grid and month bounds', () => {
    const grid = monthGrid('2026-11')
    expect(grid).toHaveLength(42)
    expect(grid[0]).toBe('2026-10-26')
    expect(isoWeekday(grid[0])).toBe(1)
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('places ONE_TIME, DAILY and WEEKLY visits like the backend generator', () => {
    const visits = planVisits(
      [
        booking({ id: 'one', startDate: '2026-11-03' }),
        booking({ id: 'daily', scheduleType: 'DAILY', startDate: '2026-10-30', endDate: '2026-11-02' }),
        // Monday and Thursday.
        booking({
          id: 'weekly',
          scheduleType: 'WEEKLY',
          startDate: '2026-11-01',
          endDate: '2026-11-15',
          daysOfWeek: [1, 4]
        })
      ],
      '2026-11-01',
      '2026-11-30'
    )
    expect(visits.get('2026-11-03')?.map((visit) => visit.bookingId)).toEqual(['one'])
    expect(visits.get('2026-11-01')?.map((visit) => visit.bookingId)).toEqual(['daily'])
    expect(visits.has('2026-10-31')).toBe(false)
    expect(
      visits
        .get('2026-11-02')
        ?.map((visit) => visit.bookingId)
        .sort()
    ).toEqual(['daily', 'weekly'])
    expect(visits.get('2026-11-05')?.map((visit) => visit.bookingId)).toEqual(['weekly'])
    expect(visits.has('2026-11-16')).toBe(false)
  })
})
