import { afterEach, describe, expect, it, vi } from 'vitest'

import { refreshSession } from './session-refresh'

function reply(status: number, data: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(data),
    headers: new Headers()
  } as Response
}

const csrf = { code: 200, result: { token: 'csrf-value', headerName: 'X-XSRF-TOKEN' } }
const refreshed = { code: 200, result: { authenticated: true } }

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('web session refresh', () => {
  it('shares one refresh among concurrent callers', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(200, csrf))
      .mockResolvedValueOnce(reply(200, refreshed))
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([refreshSession(), refreshSession()])

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/v1/auth/csrf', '/api/v1/auth/refresh'])
  })

  it('skips rotation when another tab refreshed while waiting for the browser lock', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    const request = vi.fn(async (_name: string, callback: () => Promise<void>) => {
      window.localStorage.setItem('careconnect-web-last-refresh', String(Date.now()))
      await callback()
    })
    vi.stubGlobal('navigator', { locks: { request } })

    await refreshSession()

    expect(request).toHaveBeenCalledWith('careconnect-web-session-refresh', expect.any(Function))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
