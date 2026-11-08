import { describe, expect, it } from 'vitest'

import { apiRequestErrorKey } from './error-details'

describe('apiRequestErrorKey', () => {
  it.each([
    [400, 'errors.request.invalid'],
    [401, 'errors.request.unauthorized'],
    [403, 'errors.request.forbidden'],
    [404, 'errors.request.notFound'],
    [409, 'errors.request.conflict'],
    [429, 'errors.request.rateLimited'],
    [503, 'errors.request.unavailable'],
    [500, 'errors.request.server']
  ])('maps HTTP %i to safe translated feedback', (status, expected) => {
    expect(apiRequestErrorKey({ status, info: { code: 5154, message: 'Internal payment error' } }, 'fallback')).toBe(
      expected
    )
  })

  it('distinguishes network failures and keeps a contextual fallback', () => {
    expect(apiRequestErrorKey(new TypeError('Failed to fetch'), 'fallback')).toBe('errors.request.network')
    expect(apiRequestErrorKey(new Error('IdentityService returned code 3403'), 'fallback')).toBe('fallback')
  })
})
