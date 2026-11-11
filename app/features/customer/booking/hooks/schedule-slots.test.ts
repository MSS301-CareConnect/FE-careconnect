import { describe, expect, it } from 'vitest'

import {
  durationOutliers,
  findOverlappingSlot,
  groupDays,
  mergeSlots,
  ruleIssuesOf,
  slotsFromPattern,
  type RecurrenceRule,
  type ServiceTime
} from './schedule-slots'

const weekly: RecurrenceRule = {
  frequency: 'WEEKLY',
  startDate: '2030-01-01',
  endDate: '2030-01-14',
  startTime: '08:00',
  endTime: '10:00',
  daysOfWeek: [1, 3]
}

const care: ServiceTime = { careServiceId: 'svc-1', startTime: '08:00', endTime: '10:00', enabled: true }
const bath: ServiceTime = { careServiceId: 'svc-2', startTime: '14:00', endTime: '15:00', enabled: true }
const slotsFromRule = (rule: RecurrenceRule) =>
  slotsFromPattern(rule, [care]).map(({ date, startTime, endTime }) => ({ date, startTime, endTime }))

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

  it('builds one visit per included service on each day, at its own time (2026-11-11)', () => {
    const slots = slotsFromPattern({ ...weekly, endDate: '2030-01-07' }, [
      bath,
      care,
      { ...care, careServiceId: 'svc-3', enabled: false }
    ])
    expect(slots.map((slot) => `${slot.date} ${slot.startTime} ${slot.careServiceId}`)).toEqual([
      '2030-01-02 08:00 svc-1',
      '2030-01-02 14:00 svc-2',
      '2030-01-07 08:00 svc-1',
      '2030-01-07 14:00 svc-2'
    ])
    expect(groupDays(slots)).toEqual([
      { date: '2030-01-02', indices: [0, 1] },
      { date: '2030-01-07', indices: [2, 3] }
    ])
  })

  it('points out the visit whose length differs from the other visits of its service', () => {
    const slots = slotsFromPattern(weekly, [care, bath])
    slots[4] = { ...slots[4], endTime: '11:00' }
    // The 1-hour bathing visits are not compared with the 2-hour care visits.
    expect(durationOutliers(slots)).toEqual(new Map([[4, 120]]))
    expect(durationOutliers(slots.slice(0, 1)).size).toBe(0)
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
