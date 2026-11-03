import type { BookingForm } from '../hooks/use-booking-form'

/**
 * Money facts derived from BookingService's quote and the center policy (spec §4, §8, §9.1): the initial payment
 * percent comes from the quote — never a fixed rate in the browser (B15) — and the rest is due before the first visit
 * by the policy cut-off.
 */
export function quoteFacts(form: BookingForm) {
  const data = form.quote.data
  const occurrences = data?.occurrences ?? []
  const total = data?.totalAmount ?? 0
  const depositPercent = data?.depositPercent
  const deposit = data?.estimatedDepositAmount
  const firstStart = occurrences.reduce<number | undefined>((earliest, occurrence) => {
    const start = occurrence.startAt ? Date.parse(occurrence.startAt) : undefined
    if (start === undefined) return earliest
    return earliest === undefined || start < earliest ? start : earliest
  }, undefined)
  const dueBefore = form.policy.data?.remainingPaymentDueBeforeMinutes
  const payInFull = depositPercent === undefined || depositPercent >= 100
  const remainingDue =
    !payInFull && firstStart !== undefined && dueBefore !== undefined
      ? new Date(firstStart - dueBefore * 60_000).toISOString()
      : undefined
  return {
    lines: data?.lines ?? [],
    occurrences,
    total,
    depositPercent,
    deposit,
    remaining: deposit !== undefined ? Math.max(0, total - deposit) : undefined,
    remainingDue,
    payInFull
  }
}
