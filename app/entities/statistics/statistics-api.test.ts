import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchCenterStatistics, fetchProviderStatistics, fetchSystemStatistics } from './statistics-api'

afterEach(() => vi.unstubAllGlobals())

describe('Statistics API', () => {
  it('calls the role-specific operational and provider endpoints with the session cookie', async () => {
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ code: 200, result: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    await fetchCenterStatistics()
    await fetchSystemStatistics()
    await fetchProviderStatistics()

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/statistics/centers',
      '/api/v1/statistics/system',
      '/api/v1/care-centers/statistics'
    ])
    expect(fetchMock.mock.calls.every(([, options]) => options.credentials === 'include')).toBe(true)
  })
})
