import { describe, expect, it } from 'vitest'

import {
  durationOutliers,
  findOverlappingSlot,
  mergeSlots,
  ruleIssuesOf,
  slotsFromRule,
  type RecurrenceRule
} from './schedule-slots'

const weekly: RecurrenceRule = {
  frequency: 'WEEKLY',
  startDate: '2030-01-01',
  endDate: '2030-01-14',
  startTime: '08:00',
  endTime: '10:00',
  daysOfWeek: [1, 3]
}

describe('schedule slots (CR-1)', () => {
  it('builds one visit per matching day with the pattern time', () => {
    expect(slotsFromRule(weekly)).toEqual([
      { date: '2030-01-02', startTime: '08:00', endTime: '10:00' },
      { date: '2030-01-07', startTime: '08:00', endTime: '10:00' },
      { date: '2030-01-09', startTime: '08:00', endTime: '10:00' },
      { date: '2030-01-14', startTime: '08:00', endTime: '10:00' }
    ])
    expect(ruleIssuesOf({ ...weekly, daysOfWeek: [] })).toMatchObject({ noWeekday: true, noVisits: true })
    expect(ruleIssuesOf({ ...weekly, endDate: '2029-12-31' }).invalidRange).toBe(true)
  })

  it('points out the visit whose length differs from the others', () => {
    const slots = slotsFromRule(weekly)
    slots[2] = { ...slots[2], endTime: '11:00' }
    expect(durationOutliers(slots)).toEqual({ usualMinutes: 120, outliers: new Set([2]) })
    expect(durationOutliers(slots.slice(0, 1)).usualMinutes).toBeNull()
  })

  it('quick add skips visits that overlap the list, sorts and respects the limit', () => {
    const existing = [{ date: '2030-01-07', startTime: '09:00', endTime: '11:00' }]
    const result = mergeSlots(existing, slotsFromRule(weekly))
    expect(result.added).toBe(3)
    expect(result.slots.map((slot) => `${slot.date} ${slot.startTime}`)).toEqual([
      '2030-01-02 08:00',
      '2030-01-07 09:00',
      '2030-01-09 08:00',
      '2030-01-14 08:00'
    ])
    expect(findOverlappingSlot(result.slots)).toBe(-1)

    const limited = mergeSlots(existing, slotsFromRule(weekly), 2)
    expect(limited).toMatchObject({ added: 1, skipped: 2 })
    expect(limited.slots).toHaveLength(2)
  })
})
