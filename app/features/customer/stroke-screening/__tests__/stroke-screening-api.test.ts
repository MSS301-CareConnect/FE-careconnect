import { describe, expect, it } from 'vitest'

import { strokeScreeningError } from '../stroke-screening-api'

function failure(status: number, code?: number) {
  return Object.assign(new Error('AIService'), { status, info: code === undefined ? undefined : { code } })
}

describe('stroke screening failures', () => {
  it('reads a model outage, a missing endpoint and a gateway 503 as "not available", with a retry', () => {
    expect(strokeScreeningError(failure(503, 8613))).toEqual({
      key: 'customer.strokeScreening.errors.unavailable',
      retry: true
    })
    expect(strokeScreeningError(failure(404, 404)).key).toBe('customer.strokeScreening.errors.unavailable')
    expect(strokeScreeningError(failure(503)).key).toBe('customer.strokeScreening.errors.unavailable')
  })

  it('offers no retry for a refused role or invalid answers', () => {
    expect(strokeScreeningError(failure(403, 403))).toEqual({
      key: 'customer.strokeScreening.errors.forbidden',
      retry: false
    })
    expect(strokeScreeningError(failure(400, 8001))).toEqual({
      key: 'customer.strokeScreening.errors.invalid',
      retry: false
    })
  })

  it('tells a lost connection apart from a screening result', () => {
    expect(strokeScreeningError(new TypeError('Failed to fetch'))).toEqual({
      key: 'customer.strokeScreening.errors.network',
      retry: true
    })
    expect(strokeScreeningError(failure(401, 401)).key).toBe('customer.strokeScreening.errors.session')
  })
})
