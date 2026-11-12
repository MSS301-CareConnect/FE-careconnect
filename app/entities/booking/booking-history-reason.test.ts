import { describe, expect, it } from 'vitest'

import { historyReason } from './booking-history-reason'

describe('historyReason', () => {
  it('never shows a payment reference, demo or real', () => {
    expect(historyReason('paymentReference=DEMOF0CA712D10EB4DEB')).toEqual({ kind: 'depositReceived' })
    expect(historyReason('paymentReference=14092026123456')).toEqual({ kind: 'depositReceived' })
  })

  it('names expiry codes instead of showing them', () => {
    expect(historyReason('PAYMENT_OVERDUE')).toEqual({ kind: 'expired', code: 'PAYMENT_OVERDUE' })
    expect(historyReason('INITIAL_PAYMENT_TIMEOUT')).toEqual({ kind: 'expired', code: 'INITIAL_PAYMENT_TIMEOUT' })
  })

  it('hides other machine text and keeps what people typed', () => {
    expect(historyReason('reference=ABC123')).toBeNull()
    expect(historyReason('Khách đổi lịch công tác')).toEqual({ kind: 'text', text: 'Khách đổi lịch công tác' })
    expect(historyReason('  ')).toBeNull()
  })
})
