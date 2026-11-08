import { describe, expect, it } from 'vitest'

import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'

import {
  deadlineOf,
  emptyShiftForm,
  repeatDates,
  toBatchRequest,
  validateShiftForm,
  vnInstant,
  type ShiftFormValues
} from './shift-form-model'

// 2026-11-05 10:00 Vietnam time.
const now = new Date('2026-11-05T03:00:00Z').getTime()
const today = '2026-11-05'
const base = (patch: Partial<ShiftFormValues> = {}): ShiftFormValues => ({ ...emptyShiftForm(today), ...patch })

describe('shift form rules (mirror ProviderService)', () => {
  it('accepts the default form and rejects each broken field with its own key', () => {
    expect(validateShiftForm(base(), { now, mode: 'create' })).toEqual({})
    expect(
      validateShiftForm(base({ workDate: today, startTime: '09:00', endTime: '12:00' }), { now, mode: 'create' })
    ).toMatchObject({ workDate: 'past' })
    expect(validateShiftForm(base({ startTime: '08:00', endTime: '08:30' }), { now, mode: 'create' })).toMatchObject({
      endTime: 'duration'
    })
    expect(validateShiftForm(base({ capacity: 51 }), { now, mode: 'create' })).toMatchObject({ capacity: 'capacity' })
    expect(validateShiftForm(base({ shiftType: 'DAILY' }), { now, mode: 'create' })).toMatchObject({
      shiftType: 'type'
    })
    expect(validateShiftForm(base({ note: 'x'.repeat(501) }), { now, mode: 'create' })).toMatchObject({ note: 'note' })
    expect(
      validateShiftForm(base({ deadlineMode: 'custom', deadlineDate: '2026-11-06', deadlineTime: '06:30' }), {
        now,
        mode: 'create'
      })
    ).toMatchObject({ deadline: 'deadline' })
  })

  it('lets an old shift keep its legacy type and large capacity when they do not change', () => {
    const original = {
      id: 's',
      centerId: 'c',
      workDate: '2026-11-08',
      startTime: '08:00:00',
      endTime: '12:00:00',
      shiftType: 'DAILY',
      shiftStatus: 'OPEN',
      capacity: 80,
      version: 1
    } as ProviderWorkShiftRecord
    const values = base({
      workDate: '2026-11-08',
      shiftType: 'DAILY',
      capacity: 80,
      startTime: '08:00',
      endTime: '12:00',
      note: 'new'
    })
    expect(validateShiftForm(values, { now, original, mode: 'edit' })).toEqual({})
  })

  it('falls back to one hour before when 24 hours before is already past', () => {
    const values = base({ workDate: '2026-11-06', startTime: '07:00' })
    expect(deadlineOf(values, values.workDate, now)?.toISOString()).toBe(vnInstant('2026-11-06', '06:00').toISOString())
  })

  it('repeats on the chosen weekdays and sends a lead time instead of one deadline', () => {
    const values = base({ repeat: true, workDate: '2026-11-09', repeatTo: '2026-11-22', weekdays: [1, 3] })
    expect(repeatDates(values)).toEqual(['2026-11-09', '2026-11-11', '2026-11-16', '2026-11-18'])
    expect(toBatchRequest(values, 'OPEN', now)).toMatchObject({
      workDates: repeatDates(values),
      registrationLeadMinutes: 1440
    })
    expect(validateShiftForm({ ...values, weekdays: [] }, { now, mode: 'create' })).toMatchObject({
      repeat: 'weekdays'
    })
  })
})
