import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchWebSessions, revokeSession } from './security-api'

function reply(data: unknown): Response {
  return { status: 200, ok: true, text: async () => JSON.stringify(data), headers: new Headers() } as Response
}

afterEach(() => vi.unstubAllGlobals())

describe('security sessions API', () => {
  it('lists sessions and revokes one through the gateway with CSRF headers', async () => {
    const record = { sessionId: 'session-1', isCurrent: false, userAgent: 'Browser' }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ code: 200, message: 'Success', result: [record] }))
      .mockResolvedValueOnce(
        reply({ code: 200, message: 'Success', result: { token: 'csrf-value', headerName: 'X-XSRF-TOKEN' } })
      )
      .mockResolvedValueOnce(reply({ code: 200, message: 'Success', result: null }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchWebSessions()).resolves.toEqual([record])
    await expect(revokeSession('session-1')).resolves.toBeUndefined()

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/auth/sessions',
      '/api/v1/auth/csrf',
      '/api/v1/auth/sessions/session-1'
    ])
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET', credentials: 'include' })
    expect(fetchMock.mock.calls[2][1]).toMatchObject({
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-value', 'X-Client-Type': 'web' }
    })
  })
})
