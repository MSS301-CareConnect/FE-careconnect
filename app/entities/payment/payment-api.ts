import { createDepositPayment, getPayment } from '~/shared/api/generated/api/payment/payment'
import { submitPaymentDemoResult } from '~/shared/api/generated/api/payment-demo/payment-demo'
import type { DepositPaymentRequest, PaymentDemoResultRequestOutcome } from '~/shared/api/generated/contracts'
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
  detail: (id: string) => ['payment', 'detail', id] as const
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

const KNOWN_ERROR_CODES = [6200, 6201, 6202, 6203, 6204, 6205] as const
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
