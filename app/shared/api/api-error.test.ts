import { describe, expect, it } from 'vitest'

import { classifyApiError } from './api-error'

function apiError(status: number, code?: number) {
  return Object.assign(new Error('request failed'), { status, info: code === undefined ? {} : { code } })
}

const map = {
  fields: { 4102: { field: 'name' as const, key: 'nameRequired' as const } },
  business: { 4114: 'stale' as const }
}

describe('classifyApiError', () => {
  it('puts a field code under its input', () => {
    expect(classifyApiError(apiError(400, 4102), map)).toEqual({ kind: 'field', field: 'name', key: 'nameRequired' })
  })

  it('gives a mapped business code its own sentence', () => {
    expect(classifyApiError(apiError(409, 4114), map)).toEqual({ kind: 'business', key: 'stale' })
  })

  it('treats an unmapped 4xx as a business failure', () => {
    expect(classifyApiError(apiError(409, 9999), map)).toEqual({ kind: 'business', key: 'errors.request.conflict' })
  })

  it('treats 5xx, network and unknown errors as system failures', () => {
    expect(classifyApiError(apiError(503), map)).toEqual({ kind: 'system', key: 'errors.request.unavailable' })
    expect(classifyApiError(new TypeError('Failed to fetch'), map)).toEqual({
      kind: 'system',
      key: 'errors.request.network'
    })
    expect(classifyApiError(new Error('boom'), map)).toEqual({ kind: 'system', key: 'errors.request.server' })
  })
})
