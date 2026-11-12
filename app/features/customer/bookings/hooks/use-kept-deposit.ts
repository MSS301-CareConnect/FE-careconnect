import { useQuery } from '@tanstack/react-query'

import { fetchBookingPayments, paymentKeys } from '~/entities/payment/payment-api'
import type { BookingDetailRecord, OccurrenceStatus, PaymentRecord } from '~/shared/api/generated/contracts'

// A visit that took place: money paid for it is the service, not a kept deposit.
const DELIVERED: ReadonlySet<OccurrenceStatus> = new Set(['IN_PROGRESS', 'COMPLETED', 'CUSTOMER_NO_SHOW'])

/** Paid and neither refunded nor being refunded: what PaymentService kept of a closed booking. */
export function keptAmount(payments: readonly PaymentRecord[]) {
  return payments
    .filter((payment) => payment.status === 'SUCCESS')
    .reduce((sum, payment) => sum + payment.amount - payment.refundedAmount - (payment.reservedRefundAmount ?? 0), 0)
}

/**
 * The deposit a customer lost on an EXPIRED (remaining balance overdue) or CANCELLED (late cancel) booking.
 * Customers cannot read the deposit-forfeiture ledger, so it is paid minus refunded from their own payments.
 * shortcut: a booking with a delivered visit is skipped (its payment mixes service and deposit), upgrade with a
 * customer-scoped GET /deposit-forfeitures.
 */
export function useKeptDeposit(booking: BookingDetailRecord) {
  const closed = booking.status === 'EXPIRED' || booking.status === 'CANCELLED'
  const delivered = (booking.occurrences ?? []).some((visit) => DELIVERED.has(visit.status))
  const payments = useQuery({
    queryKey: paymentKeys.ofBooking(booking.id),
    queryFn: () => fetchBookingPayments(booking.id),
    enabled: closed && !delivered,
    retry: false
  })
  const amount = payments.data ? keptAmount(payments.data) : 0
  if (amount <= 0) return null
  return { amount, reason: booking.status === 'EXPIRED' ? ('overdue' as const) : ('lateCancel' as const) }
}
