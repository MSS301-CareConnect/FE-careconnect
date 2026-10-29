import { useQuery } from '@tanstack/react-query'

import {
  createBookingCheckout,
  getMyOutstandingDebt,
  getPayment,
  listPayments,
  verifyVnPayReturn
} from '~/shared/api/generated/api/payment/payment'
import { getEffectivePaymentPolicy } from '~/shared/api/generated/api/payment-policy/payment-policy'
import { listRefunds } from '~/shared/api/generated/api/refund/refund'
import {
  listRemainingInvoices,
  payRemainingInvoice
} from '~/shared/api/generated/api/remaining-invoice/remaining-invoice'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })
// D16: PaymentService only opens VNPay checkouts; the VNPay page lets the customer pick QR, ATM or card.
const VNPAY = { provider: 'VNPAY' as const }
export const PAYMENT_PAGE_SIZE = 10

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`PaymentService returned code ${response.data.code}`)
  return response.data.result
}

export const paymentKeys = {
  all: ['payment'] as const,
  detail: (id: string) => ['payment', 'detail', id] as const,
  policy: (centerId: string) => ['payment', 'policy', centerId] as const,
  history: (page: number) => ['payment', 'history', page] as const,
  refunds: (page: number) => ['payment', 'refunds', page] as const,
  invoices: (page: number) => ['payment', 'invoices', page] as const,
  outstanding: ['payment', 'outstanding'] as const,
  vnPayReturn: (query: string) => ['payment', 'vnpay-return', query] as const
}

/** Policy in effect for a center (C2.1); PaymentService owns the deposit percent. */
export async function fetchEffectivePolicy(centerId: string) {
  return result(await getEffectivePaymentPolicy({ centerId }, readOptions))
}

/** The deposit PaymentService charges: the booking total times the policy percent, in whole dong. */
export function estimateDeposit(totalAmount: number | undefined, depositPercent: number | undefined) {
  if (totalAmount === undefined || depositPercent === undefined) return undefined
  return Math.round((totalAmount * depositPercent) / 100)
}

/**
 * The booking's deposit. BookingService leaves `depositAmount` empty (PaymentService keeps the per-visit split),
 * so the amount is estimated from the center's policy and flagged as such; the checkout shows the exact figure.
 */
export function useDepositAmount(booking: BookingDetailRecord | undefined) {
  const recorded = booking?.depositAmount ?? undefined
  const centerId = booking?.centerId ?? ''
  const policy = useQuery({
    queryKey: paymentKeys.policy(centerId),
    queryFn: () => fetchEffectivePolicy(centerId),
    enabled: Boolean(centerId) && recorded === undefined,
    retry: false,
    staleTime: 5 * 60_000
  })
  if (recorded !== undefined) return { amount: recorded, estimated: false, isPending: false }
  return {
    amount: estimateDeposit(booking?.totalAmount, policy.data?.depositPercent),
    estimated: true,
    isPending: policy.isPending && Boolean(centerId)
  }
}

/** Opens a VNPay deposit checkout (PAY-05); PaymentService expires any earlier open session of the booking. */
export async function startDepositCheckout(bookingId: string) {
  return result(await createBookingCheckout(bookingId, VNPAY, await writeOptions()))
}

/** Opens a VNPay checkout for a pending or overdue remaining-balance invoice (PAY-11). */
export async function startInvoiceCheckout(invoiceId: string) {
  return result(await payRemainingInvoice(invoiceId, VNPAY, await writeOptions()))
}

export async function fetchPayment(id: string) {
  return result(await getPayment(id, readOptions))
}

export async function fetchPaymentHistory(page: number) {
  return result(await listPayments({ page, size: PAYMENT_PAGE_SIZE }, readOptions))
}

export async function fetchRefundHistory(page: number) {
  return result(await listRefunds({ page, size: PAYMENT_PAGE_SIZE }, readOptions))
}

export async function fetchRemainingInvoices(page: number) {
  return result(await listRemainingInvoices({ page, size: PAYMENT_PAGE_SIZE }, readOptions))
}

export async function fetchOutstandingDebt() {
  return result(await getMyOutstandingDebt(readOptions))
}

/** PaymentService checks the VNPay signature of the browser return; the IPN still decides the payment status. */
export async function verifyReturn(params: Record<string, string>) {
  const signed = { ...params, vnp_TxnRef: params.vnp_TxnRef ?? '', vnp_SecureHash: params.vnp_SecureHash ?? '' }
  return result(await verifyVnPayReturn(signed, readOptions))
}

/** Leaves the app for the VNPay checkout page returned by PaymentService. */
export function redirectToCheckout(checkoutUrl: string) {
  window.location.assign(checkoutUrl)
}

const KNOWN_ERROR_CODES = [6004, 6005, 6006, 6007, 6008, 6012, 6017, 6018, 6019, 6024, 6025] as const
export type PaymentErrorKey =
  `payment.errors.e${(typeof KNOWN_ERROR_CODES)[number]}` | 'payment.errors.unavailable' | 'payment.errors.generic'

/** Maps a PaymentService failure to a translated message instead of showing backend text. */
export function paymentErrorKey(error: unknown): PaymentErrorKey {
  const info = typeof error === 'object' && error !== null && 'info' in error ? error.info : undefined
  const code =
    typeof info === 'object' && info !== null && 'code' in info && typeof info.code === 'number' ? info.code : undefined
  const known = KNOWN_ERROR_CODES.find((item) => item === code)
  if (known) return `payment.errors.e${known}`
  const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined
  return status === 503 || status === 502 ? 'payment.errors.unavailable' : 'payment.errors.generic'
}
