import { describe, expect, it } from 'vitest'

import type { PaymentRecord } from '~/shared/api/generated/contracts'

import { keptAmount } from './use-kept-deposit'

const paid = (amount: number, refundedAmount = 0, extra: Partial<PaymentRecord> = {}): PaymentRecord => ({
  id: 'p',
  bookingId: 'b',
  paymentType: 'DEPOSIT',
  status: 'SUCCESS',
  amount,
  refundedAmount,
  currency: 'VND',
  ...extra
})

describe('keptAmount', () => {
  it('counts what was paid and neither refunded nor being refunded', () => {
    expect(keptAmount([paid(100000, 30000, { reservedRefundAmount: 20000 })])).toBe(50000)
    expect(keptAmount([paid(100000, 100000)])).toBe(0)
    expect(keptAmount([paid(100000, 0, { status: 'FAILED' })])).toBe(0)
  })
})
