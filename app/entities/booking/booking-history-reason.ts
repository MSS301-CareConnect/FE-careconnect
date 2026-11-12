import { BookingExpiredReason } from '~/shared/api/generated/contracts'

/**
 * What a history `reason` may show (V-04, D-10). BookingService stores the deposit's payment reference there as
 * `paymentReference=<code>` (a VNPay `vnp_TxnRef`, or `DEMO…` from the removed payment stub); that code is kept for
 * reconciliation but never shown. An expiry code (`PAYMENT_OVERDUE`…) is named in words. Any other machine-written
 * `key=value` text is hidden as well; reasons people typed (cancel, reject, no-show) pass through unchanged.
 */
export type HistoryReason =
  { kind: 'depositReceived' } | { kind: 'expired'; code: BookingExpiredReason } | { kind: 'text'; text: string } | null

const PAYMENT_REFERENCE = /^paymentReference=/
const MACHINE_TEXT = /^[A-Za-z][A-Za-z0-9_]*=\S+$/
const EXPIRED_CODES = Object.values(BookingExpiredReason)

export function historyReason(reason: string | undefined | null): HistoryReason {
  const text = reason?.trim()
  if (!text) return null
  if (PAYMENT_REFERENCE.test(text)) return { kind: 'depositReceived' }
  const code = EXPIRED_CODES.find((item) => item === text)
  if (code) return { kind: 'expired', code }
  if (MACHINE_TEXT.test(text)) return null
  return { kind: 'text', text }
}
