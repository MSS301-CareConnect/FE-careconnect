// Development-only stand-in for the customer-facing part of PaymentService (PAY-05/06).
//
// PaymentService is not in the backend repository yet. BookingService already calls the payment mock
// (BE/scripts/e2e/payment_stub.py) for debt checks, refund previews, refunds and invoices; that stub has no
// API for the web, so `pnpm dev` answers these three paths itself and lets every other /api/v1/payments/*
// request continue through the /api proxy to the gateway and the stub:
//
//   POST /api/v1/payments/deposits              create a deposit session (contract PAY-05)
//   GET  /api/v1/payments/{id}                  read a session (contract PAY-06)
//   POST /api/v1/payments/{id}/demo-results     the demo gateway reports SUCCESS or FAILED
//
// On SUCCESS it confirms the deposit the way PaymentService will after a VNPay IPN: it takes a SERVICE
// token from IdentityService and calls BookingService `deposit-paid` (steps 2.7-2.8 of the booking test
// guide). The client secret is read by the Node dev server only and never reaches the browser bundle.

import { randomUUID as nodeRandomUUID } from 'node:crypto'

const SESSION_TTL_MS = 15 * 60 * 1000
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000
const PAYMENT_PATH = /^\/api\/v1\/payments\/([0-9a-f-]{36})$/i
const RESULT_PATH = /^\/api\/v1\/payments\/([0-9a-f-]{36})\/demo-results$/i

export const PAYMENT_DEMO_ERRORS = Object.freeze({
  PAYMENT_NOT_FOUND: 6200,
  BOOKING_NOT_AWAITING_DEPOSIT: 6201,
  DEPOSIT_DUE_PASSED: 6202,
  PAYMENT_NOT_PENDING: 6203,
  DEMO_NOT_CONFIGURED: 6204,
  DEPOSIT_CONFIRMATION_FAILED: 6205,
  INVALID_REQUEST: 6206,
  BOOKING_PRICE_MISSING: 6207,
  NO_EFFECTIVE_POLICY: 6208
})

class DemoError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

const ok = (result) => ({ status: 200, body: { code: 200, message: 'Payment demo', result } })
const fail = (error) => ({ status: error.status, body: { code: error.code, message: error.message } })

/**
 * @param {{ target: string, clientId?: string, clientSecret?: string, fetchImpl?: typeof fetch,
 *   now?: () => number, randomUUID?: () => string }} options
 */
export function createPaymentDemo({
  target,
  clientId,
  clientSecret,
  fetchImpl = fetch,
  now = Date.now,
  randomUUID = nodeRandomUUID
}) {
  const base = target.replace(/\/$/, '')
  /** @type {Map<string, any>} */
  const payments = new Map()
  let serviceToken = null

  async function call(path, init) {
    const response = await fetchImpl(`${base}${path}`, init)
    const text = await response.text()
    const body = text ? JSON.parse(text) : {}
    return { status: response.status, body }
  }

  async function currentUserId(cookie) {
    const { status, body } = await call('/api/v1/users/me', { headers: { cookie } })
    if (status !== 200 || !body.result?.id)
      throw new DemoError(status === 200 ? 401 : status, body.code ?? status, body.message ?? 'Unauthenticated')
    return body.result.id
  }

  async function serviceAccessToken() {
    if (!clientId || !clientSecret) {
      throw new DemoError(
        503,
        PAYMENT_DEMO_ERRORS.DEMO_NOT_CONFIGURED,
        'PAYMENT_DEMO_SERVICE_CLIENT_ID/SECRET are not set'
      )
    }
    if (serviceToken && serviceToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > now()) return serviceToken.value
    const { status, body } = await call('/api/v1/auth/service-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret })
    })
    if (status !== 200 || !body.result?.accessToken) {
      throw new DemoError(503, PAYMENT_DEMO_ERRORS.DEMO_NOT_CONFIGURED, 'IdentityService refused the service client')
    }
    serviceToken = { value: body.result.accessToken, expiresAt: now() + body.result.expiresInSeconds * 1000 }
    return serviceToken.value
  }

  function view(payment) {
    // A session nobody completed in time expires, like the 15 minute VNPay session (PAY-07).
    if (payment.status === 'PENDING' && Date.parse(payment.expiresAt) <= now()) payment.status = 'EXPIRED'
    const { customerId: _customerId, ...record } = payment
    return record
  }

  async function ownedPayment(id, cookie) {
    const userId = await currentUserId(cookie)
    const payment = payments.get(id)
    if (!payment || payment.customerId !== userId) {
      throw new DemoError(404, PAYMENT_DEMO_ERRORS.PAYMENT_NOT_FOUND, 'Payment not found')
    }
    return payment
  }

  // BookingService leaves the deposit to PaymentService (PAY-05): the total times the deposit percent of the
  // policy in effect for the center (C2.1, answered by payment_stub.py through the gateway), in whole dong.
  async function depositAmount(cookie, centerId, total) {
    const query = new URLSearchParams({ centerId, at: new Date(now()).toISOString() })
    const policy = await call(`/api/v1/payment-policies/effective?${query}`, { headers: { cookie } })
    const percent = Number(policy.body.result?.depositPercent)
    if (policy.status !== 200 || !(percent > 0)) {
      throw new DemoError(503, PAYMENT_DEMO_ERRORS.NO_EFFECTIVE_POLICY, 'No payment policy in effect for the center')
    }
    return Math.round((total * percent) / 100)
  }

  async function createDeposit(cookie, request) {
    if (!request?.bookingId) throw new DemoError(400, PAYMENT_DEMO_ERRORS.INVALID_REQUEST, 'bookingId is required')
    const userId = await currentUserId(cookie)
    // Reading the booking with the customer's own cookies keeps BookingService's ownership rule.
    const booking = await call(`/api/v1/bookings/${encodeURIComponent(request.bookingId)}`, { headers: { cookie } })
    if (booking.status !== 200) {
      throw new DemoError(booking.status, booking.body.code ?? booking.status, booking.body.message ?? 'Booking error')
    }
    const detail = booking.body.result
    if (detail.status !== 'AWAITING_DEPOSIT') {
      throw new DemoError(409, PAYMENT_DEMO_ERRORS.BOOKING_NOT_AWAITING_DEPOSIT, 'Booking is not awaiting a deposit')
    }
    const dueAt = detail.depositDueAt ? Date.parse(detail.depositDueAt) : Number.POSITIVE_INFINITY
    if (dueAt <= now()) throw new DemoError(409, PAYMENT_DEMO_ERRORS.DEPOSIT_DUE_PASSED, 'The deposit is overdue')
    const total = Number(detail.totalAmount ?? 0)
    if (!(total > 0)) throw new DemoError(409, PAYMENT_DEMO_ERRORS.BOOKING_PRICE_MISSING, 'The booking has no price')
    const amount = await depositAmount(cookie, detail.centerId, total)

    // Same booking and amount with a live session returns that session (PAY-05 idempotency).
    for (const existing of payments.values()) {
      if (existing.bookingId === detail.id && existing.amount === amount && view(existing).status === 'PENDING') {
        return toSession(existing)
      }
    }
    const id = randomUUID()
    const payment = {
      id,
      bookingId: detail.id,
      customerId: userId,
      type: 'DEPOSIT',
      amount,
      status: 'PENDING',
      txnRef: `DEMO${id.replaceAll('-', '').slice(0, 16).toUpperCase()}`,
      expiresAt: new Date(Math.min(now() + SESSION_TTL_MS, dueAt)).toISOString()
    }
    payments.set(id, payment)
    return toSession(payment)
  }

  function toSession(payment) {
    return {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount,
      // VNPay would host this page; the demo gateway is a customer route of this app.
      paymentUrl: `/customer/payments/${payment.id}/gateway`,
      expiresAt: payment.expiresAt,
      status: view(payment).status
    }
  }

  async function completeDemo(id, cookie, request) {
    const payment = await ownedPayment(id, cookie)
    if (view(payment).status !== 'PENDING') {
      throw new DemoError(409, PAYMENT_DEMO_ERRORS.PAYMENT_NOT_PENDING, 'Payment is no longer pending')
    }
    if (request?.outcome === 'FAILED') {
      payment.status = 'FAILED'
      payment.failureReason = 'CUSTOMER_DECLINED'
      return view(payment)
    }
    if (request?.outcome !== 'SUCCESS') {
      throw new DemoError(400, PAYMENT_DEMO_ERRORS.INVALID_REQUEST, 'outcome must be SUCCESS or FAILED')
    }
    const token = await serviceAccessToken()
    const confirmation = await call(`/api/v1/bookings/${payment.bookingId}/deposit-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentReference: payment.txnRef })
    })
    if (confirmation.status !== 200) {
      // The money would be refunded as LATE_PAYMENT by the real service; the demo just records the failure.
      payment.status = 'FAILED'
      payment.failureReason = 'BOOKING_NOT_CONFIRMABLE'
      throw new DemoError(
        409,
        PAYMENT_DEMO_ERRORS.DEPOSIT_CONFIRMATION_FAILED,
        confirmation.body.message ?? 'Booking refused the deposit'
      )
    }
    payment.status = 'SUCCESS'
    payment.paidAt = new Date(now()).toISOString()
    return view(payment)
  }

  /** True for the three paths the demo answers; everything else goes on to the gateway untouched. */
  function matches(method, path) {
    return (
      (method === 'POST' && path === '/api/v1/payments/deposits') ||
      (method === 'GET' && PAYMENT_PATH.test(path)) ||
      (method === 'POST' && RESULT_PATH.test(path))
    )
  }

  /**
   * Answers one of the demo paths, or returns null so the request continues to the gateway.
   * @param {{ method: string, path: string, cookie?: string, body?: any }} request
   */
  async function handle({ method, path, cookie = '', body }) {
    let action = null
    if (method === 'POST' && path === '/api/v1/payments/deposits') action = () => createDeposit(cookie, body)
    const read = PAYMENT_PATH.exec(path)
    if (method === 'GET' && read) action = async () => view(await ownedPayment(read[1], cookie))
    const result = RESULT_PATH.exec(path)
    if (method === 'POST' && result) action = () => completeDemo(result[1], cookie, body)
    if (!action) return null
    try {
      return ok(await action())
    } catch (error) {
      if (error instanceof DemoError) return fail(error)
      return fail(
        new DemoError(503, PAYMENT_DEMO_ERRORS.DEMO_NOT_CONFIGURED, 'Payment demo could not reach the gateway')
      )
    }
  }

  return { handle, matches }
}

function readJson(request) {
  return new Promise((resolve) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined)
      } catch {
        resolve(undefined)
      }
    })
  })
}

/** Vite plugin that serves the demo paths during `pnpm dev` only (never in a build). */
export function paymentDemoPlugin({ target, clientId, clientSecret }) {
  return {
    name: 'careconnect-payment-demo',
    apply: 'serve',
    configureServer(server) {
      const demo = createPaymentDemo({ target, clientId, clientSecret })
      // Registered directly, so it runs before Vite's /api proxy.
      server.middlewares.use(async (request, response, next) => {
        const path = (request.url ?? '').split('?')[0]
        const method = request.method ?? 'GET'
        // Only demo requests are read here, so proxied requests keep their body stream.
        if (!demo.matches(method, path)) return next()
        const handled = await demo.handle({
          method,
          path,
          cookie: request.headers.cookie,
          body: method === 'POST' ? await readJson(request) : undefined
        })
        if (!handled) return next()
        response.statusCode = handled.status
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(handled.body))
      })
    }
  }
}
