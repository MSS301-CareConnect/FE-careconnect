import { describe, expect, it } from 'vitest'

import { groupByBooking } from '~/entities/booking/booking-group-card'
import { pageSizeOf } from '~/shared/ui/pagination'

import { insightRange } from './statistics-period'

const now = new Date('2026-11-11T05:00:00Z')

describe('insightRange', () => {
  it('uses the picked calendar days, inclusive, and charts a long range per month', () => {
    const range = insightRange('custom', now, { from: '2026-08-01', to: '2026-10-31' })
    expect(range).toMatchObject({ fromDate: '2026-08-01', toDate: '2026-10-31', groupBy: 'MONTH' })
    expect(range.from).toBe('2026-07-31T17:00:00.000Z')
    // End of 31/10 in Vietnam, exclusive.
    expect(range.to).toBe('2026-10-31T17:00:00.000Z')
  })

  it('never reads past now and falls back to this month for a missing or reversed range', () => {
    expect(insightRange('custom', now, { from: '2026-11-01', to: '2026-11-30' }).to).toBe(now.toISOString())
    expect(insightRange('custom', now, { from: '2026-11-10', to: '2026-11-01' })).toMatchObject({
      fromDate: '2026-11-01',
      toDate: '2026-11-11',
      groupBy: 'DAY'
    })
    expect(insightRange('custom', now).fromDate).toBe('2026-11-01')
  })
})

describe('list helpers', () => {
  it('groups rows per booking in list order', () => {
    const rows = [{ bookingId: 'a' }, { bookingId: 'b' }, { bookingId: 'a' }]
    expect(groupByBooking(rows).map((group) => [group.bookingId, group.rows.length])).toEqual([
      ['a', 2],
      ['b', 1]
    ])
  })

  it('accepts only an offered page size', () => {
    expect(pageSizeOf('20', 10)).toBe(20)
    expect(pageSizeOf('7', 10)).toBe(10)
    expect(pageSizeOf(null, 10)).toBe(10)
  })
})
