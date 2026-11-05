import { describe, expect, it } from 'vitest'

import { shiftStatusLabelKey, shiftTypeLabelKey, timeRangesOverlap } from './work-shift'

describe('work-shift vocabulary', () => {
  it('labels known shift types and never shows a raw legacy code', () => {
    expect(shiftTypeLabelKey('MORNING')).toBe('common.status.shiftType.MORNING')
    expect(shiftTypeLabelKey(' daily ')).toBe('common.status.shiftType.DAILY')
    expect(shiftTypeLabelKey('DAY')).toBe('common.status.shiftType.OTHER')
    expect(shiftTypeLabelKey(undefined)).toBe('common.status.shiftType.OTHER')
  })

  it('labels every shift status', () => {
    expect(shiftStatusLabelKey('DRAFT')).toBe('common.status.shift.DRAFT')
    expect(shiftStatusLabelKey('OPEN')).toBe('common.status.shift.OPEN')
  })

  it('treats touching time ranges as not overlapping', () => {
    expect(timeRangesOverlap({ start: '08:00', end: '12:00' }, { start: '12:00', end: '14:00' })).toBe(false)
    expect(timeRangesOverlap({ start: '08:00', end: '12:00' }, { start: '11:30', end: '14:00' })).toBe(true)
  })
})
