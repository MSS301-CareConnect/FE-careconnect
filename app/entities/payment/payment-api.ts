import { useQuery } from '@tanstack/react-query'

import { createDepositPayment, getPayment } from '~/shared/api/generated/api/payment/payment'
import { submitPaymentDemoResult } from '~/shared/api/generated/api/payment-demo/payment-demo'
import { getEffectivePaymentPolicy } from '~/shared/api/generated/api/payment-policy/payment-policy'
import type {
  BookingDetailRecord,
  DepositPaymentRequest,
  PaymentDemoResultRequestOutcome
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async (headers: HeadersInit = {}) => ({
  credentials: 'include' as const,
  headers: { ...(await csrfHeaders()), ...headers }
})

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`PaymentService returned code ${response.data.code}`)
  return response.data.result
}

export const paymentKeys = {
  all: ['payment'] as const,
  detail: (id: string) => ['payment', 'detail', id] as const,
  policy: (centerId: string) => ['payment', 'policy', centerId] as const
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
 * The booking's deposit. BookingService leaves `depositAmount` empty until PaymentService records it, so
 * until then the amount is estimated from the center's policy and flagged as such.
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

/** Opens a deposit session (PAY-05); the same Idempotency-Key returns the same live session. */
export async function startDepositPayment(request: DepositPaymentRequest, idempotencyKey: string) {
  return result(await createDepositPayment(request, await writeOptions({ 'Idempotency-Key': idempotencyKey })))
}
export async function fetchPayment(id: string) {
  return result(await getPayment(id, readOptions))
}
/** Development-only demo gateway answered by `pnpm dev`; SUCCESS confirms the booking deposit. */
export async function submitDemoPayment(id: string, outcome: PaymentDemoResultRequestOutcome) {
  return result(await submitPaymentDemoResult(id, { outcome }, await writeOptions()))
}

const KNOWN_ERROR_CODES = [6200, 6201, 6202, 6203, 6204, 6205, 6207] as const
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
  return status === 503 || status === 404 ? 'payment.errors.unavailable' : 'payment.errors.generic'
}
