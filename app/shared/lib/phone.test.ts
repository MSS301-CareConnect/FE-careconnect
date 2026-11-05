import { describe, expect, it } from 'vitest'

import { formatPhone, phoneHref } from './phone'

describe('formatPhone', () => {
  it('groups Vietnamese mobile and landline numbers', () => {
    expect(formatPhone('0912345678')).toBe('0912 345 678')
    expect(formatPhone('0912.345.678')).toBe('0912 345 678')
    expect(formatPhone('02838221234')).toBe('028 3822 1234')
  })

  it('normalizes 84 / +84 numbers, also with the extra leading zero', () => {
    expect(formatPhone('+84912345678')).toBe('+84 912 345 678')
    expect(formatPhone('84912345678')).toBe('+84 912 345 678')
    expect(formatPhone('+84 0912 345 678')).toBe('+84 912 345 678')
  })

  it('keeps unknown shapes readable and empty values empty', () => {
    expect(formatPhone('123456789012')).toBe('123 456 789 012')
    expect(formatPhone(undefined)).toBe('')
    expect(phoneHref('0912 345 678')).toBe('tel:0912345678')
  })
})
