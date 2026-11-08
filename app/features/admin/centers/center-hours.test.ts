import { describe, expect, it } from 'vitest'

import { parseCenterHours } from './center-hours'

describe('parseCenterHours', () => {
  it('accepts day, overnight and around-the-clock hours', () => {
    expect(parseCenterHours('07:00 - 17:30')).toEqual({ kind: 'range', open: '07:00', close: '17:30' })
    expect(parseCenterHours('22:00 - 06:00')).toEqual({ kind: 'overnight', open: '22:00', close: '06:00' })
    expect(parseCenterHours('00:00 - 00:00')).toEqual({ kind: 'allDay', open: '00:00', close: '00:00' })
  })

  it('keeps free text and empty values apart', () => {
    expect(parseCenterHours('Thứ 2 - Thứ 7')).toEqual({ kind: 'legacy', text: 'Thứ 2 - Thứ 7' })
    expect(parseCenterHours('  ')).toEqual({ kind: 'none' })
  })
})
