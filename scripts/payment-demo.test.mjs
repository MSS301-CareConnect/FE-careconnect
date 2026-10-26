import assert from 'node:assert/strict'
import test from 'node:test'

import { PAYMENT_DEMO_ERRORS, createPaymentDemo } from './payment-demo.mjs'

const NOW = Date.parse('2026-11-01T01:00:00Z')
const BOOKING_ID = '11111111-1111-4111-8111-111111111111'
const PAYMENT_ID = '22222222-2222-4222-8222-222222222222'

function json(status, body) {
  return { status, text: async () => JSON.stringify(body) }
}

/** A gateway double: the customer owns one booking awaiting a 60 000 VND deposit. */
function gateway({ bookingStatus = 'AWAITING_DEPOSIT', depositPaidStatus = 200 } = {}) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    const path = new URL(url).pathname
    calls.push({ path, init })
    if (path === '/api/v1/users/me') {
      return init.headers?.cookie === 'access=customer'
        ? json(200, { code: 200, result: { id: 'customer-1' } })
        : json(401, { code: 1401, message: 'Unauthenticated' })
    }
    if (path === `/api/v1/bookings/${BOOKING_ID}`) {
      return json(200, {
        code: 200,
        result: {
          id: BOOKING_ID,
          status: bookingStatus,
          depositAmount: 60000,
          depositDueAt: new Date(NOW + 60 * 60 * 1000).toISOString()
        }
      })
    }
    if (path === '/api/v1/auth/service-token') {
      return json(200, { code: 200, result: { accessToken: 'service-token', expiresInSeconds: 900 } })
    }
    if (path === `/api/v1/bookings/${BOOKING_ID}/deposit-paid`) {
      return json(depositPaidStatus, { code: depositPaidStatus === 200 ? 200 : 5101, message: 'Booking reply' })
    }
    return json(404, { code: 404 })
  }
  return { calls, fetchImpl }
}

function demo(fetchImpl, now = () => NOW) {
  return createPaymentDemo({
    target: 'http://gateway.test',
    clientId: 'booking',
    clientSecret: 'secret',
    fetchImpl,
    now,
    randomUUID: () => PAYMENT_ID
  })
}

const customer = 'access=customer'

test('lets every non-demo payment path through to the gateway and the payment stub', async () => {
  const { handle, matches } = demo(gateway().fetchImpl)
  assert.equal(matches('GET', '/api/v1/payments/me/outstanding'), false)
  assert.equal(matches('POST', '/api/v1/refunds'), false)
  assert.equal(await handle({ method: 'GET', path: '/api/v1/payment-policies/effective', cookie: customer }), null)
})

test('creates a deposit session for the owner of a booking awaiting the deposit, once', async () => {
  const { handle } = demo(gateway().fetchImpl)
  const created = await handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: customer,
    body: { bookingId: BOOKING_ID }
  })

  assert.equal(created.status, 200)
  assert.deepEqual(created.body.result, {
    paymentId: PAYMENT_ID,
    bookingId: BOOKING_ID,
    amount: 60000,
    paymentUrl: `/customer/payments/${PAYMENT_ID}/gateway`,
    expiresAt: new Date(NOW + 15 * 60 * 1000).toISOString(),
    status: 'PENDING'
  })
  const again = await handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: customer,
    body: { bookingId: BOOKING_ID }
  })
  assert.deepEqual(again.body.result, created.body.result)
})

test('refuses a booking that is not awaiting a deposit and an anonymous caller', async () => {
  const confirmed = demo(gateway({ bookingStatus: 'CONFIRMED' }).fetchImpl)
  const refused = await confirmed.handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: customer,
    body: { bookingId: BOOKING_ID }
  })
  assert.equal(refused.status, 409)
  assert.equal(refused.body.code, PAYMENT_DEMO_ERRORS.BOOKING_NOT_AWAITING_DEPOSIT)

  const anonymous = await demo(gateway().fetchImpl).handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: '',
    body: { bookingId: BOOKING_ID }
  })
  assert.equal(anonymous.status, 401)
})

test('confirms the deposit at BookingService with a SERVICE token when the demo gateway succeeds', async () => {
  const { calls, fetchImpl } = gateway()
  const { handle } = demo(fetchImpl)
  await handle({ method: 'POST', path: '/api/v1/payments/deposits', cookie: customer, body: { bookingId: BOOKING_ID } })

  const paid = await handle({
    method: 'POST',
    path: `/api/v1/payments/${PAYMENT_ID}/demo-results`,
    cookie: customer,
    body: { outcome: 'SUCCESS' }
  })
  assert.equal(paid.status, 200)
  assert.equal(paid.body.result.status, 'SUCCESS')
  const confirmation = calls.find((call) => call.path.endsWith('/deposit-paid'))
  assert.equal(confirmation.init.headers.Authorization, 'Bearer service-token')
  // The secret only travels from the dev server to IdentityService.
  assert.deepEqual(JSON.parse(calls.find((call) => call.path === '/api/v1/auth/service-token').init.body), {
    clientId: 'booking',
    clientSecret: 'secret'
  })

  const read = await handle({ method: 'GET', path: `/api/v1/payments/${PAYMENT_ID}`, cookie: customer })
  assert.equal(read.body.result.status, 'SUCCESS')
  assert.equal(read.body.result.customerId, undefined)
})

test('records a declined payment without touching the booking', async () => {
  const { calls, fetchImpl } = gateway()
  const { handle } = demo(fetchImpl)
  await handle({ method: 'POST', path: '/api/v1/payments/deposits', cookie: customer, body: { bookingId: BOOKING_ID } })
  const declined = await handle({
    method: 'POST',
    path: `/api/v1/payments/${PAYMENT_ID}/demo-results`,
    cookie: customer,
    body: { outcome: 'FAILED' }
  })

  assert.equal(declined.body.result.status, 'FAILED')
  assert.equal(
    calls.some((call) => call.path.endsWith('/deposit-paid')),
    false
  )
  const repeat = await handle({
    method: 'POST',
    path: `/api/v1/payments/${PAYMENT_ID}/demo-results`,
    cookie: customer,
    body: { outcome: 'SUCCESS' }
  })
  assert.equal(repeat.body.code, PAYMENT_DEMO_ERRORS.PAYMENT_NOT_PENDING)
})

test('marks the payment failed when BookingService refuses the deposit, and expires stale sessions', async () => {
  const refusing = demo(gateway({ depositPaidStatus: 409 }).fetchImpl)
  await refusing.handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: customer,
    body: { bookingId: BOOKING_ID }
  })
  const result = await refusing.handle({
    method: 'POST',
    path: `/api/v1/payments/${PAYMENT_ID}/demo-results`,
    cookie: customer,
    body: { outcome: 'SUCCESS' }
  })
  assert.equal(result.body.code, PAYMENT_DEMO_ERRORS.DEPOSIT_CONFIRMATION_FAILED)
  const failed = await refusing.handle({ method: 'GET', path: `/api/v1/payments/${PAYMENT_ID}`, cookie: customer })
  assert.equal(failed.body.result.status, 'FAILED')

  let clock = NOW
  const slow = demo(gateway().fetchImpl, () => clock)
  await slow.handle({
    method: 'POST',
    path: '/api/v1/payments/deposits',
    cookie: customer,
    body: { bookingId: BOOKING_ID }
  })
  clock += 16 * 60 * 1000
  const expired = await slow.handle({ method: 'GET', path: `/api/v1/payments/${PAYMENT_ID}`, cookie: customer })
  assert.equal(expired.body.result.status, 'EXPIRED')
})

test('hides another customer’s payment', async () => {
  const { handle } = demo(gateway().fetchImpl)
  await handle({ method: 'POST', path: '/api/v1/payments/deposits', cookie: customer, body: { bookingId: BOOKING_ID } })
  const other = await handle({ method: 'GET', path: `/api/v1/payments/${PAYMENT_ID}`, cookie: 'access=someone-else' })
  assert.equal(other.status, 401)
})
