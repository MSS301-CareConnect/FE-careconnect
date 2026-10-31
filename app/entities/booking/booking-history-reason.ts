/**
 * What a history `reason` may show (V-04, D-10). BookingService stores the deposit's payment reference there as
 * `paymentReference=<code>` (a VNPay `vnp_TxnRef`, or `DEMO…` from the removed payment stub); that code is kept for
 * reconciliation but never shown. Any other machine-written `key=value` text is hidden as well; reasons people typed
 * (cancel, reject, no-show) pass through unchanged.
 */
export type HistoryReason = { kind: 'depositReceived' } | { kind: 'text'; text: string } | null

const PAYMENT_REFERENCE = /^paymentReference=/
const MACHINE_TEXT = /^[A-Za-z][A-Za-z0-9_]*=\S+$/

export function historyReason(reason: string | undefined | null): HistoryReason {
  const text = reason?.trim()
  if (!text) return null
  if (PAYMENT_REFERENCE.test(text)) return { kind: 'depositReceived' }
  if (MACHINE_TEXT.test(text)) return null
  return { kind: 'text', text }
}
