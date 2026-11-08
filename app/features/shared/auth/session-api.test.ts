import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadSession, signIn, signOut } from './session-api'

function reply(status: number, data: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(data),
    headers: new Headers()
  } as Response
}

const user = { id: 'u-1', email: 'admin@careconnect.test', status: 'ACTIVE', roles: ['ADMIN'] }
const csrf = { code: 200, message: 'Success', result: { token: 'csrf-value', headerName: 'X-XSRF-TOKEN' } }

afterEach(() => vi.unstubAllGlobals())

describe('web session API', () => {
  it('gets CSRF and sends credentials before login, then reads the backend user', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(200, csrf))
      .mockResolvedValueOnce(
        reply(200, {
          code: 200,
          message: 'Success',
          result: { authenticated: true, csrfToken: 'next', expiresInSeconds: 900 }
        })
      )
      .mockResolvedValueOnce(reply(200, { code: 200, message: 'Success', result: user }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(signIn({ email: user.email, password: 'secret' })).resolves.toMatchObject(user)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/auth/csrf',
      '/api/v1/auth/login',
      '/api/v1/users/me'
    ])
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      method: 'POST',
      headers: { 'X-XSRF-TOKEN': 'csrf-value', 'X-Client-Type': 'web' }
    })
  })

  it('refreshes an expired access cookie once and retries the user request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(401, { code: 401, message: 'Expired' }))
      .mockResolvedValueOnce(reply(200, csrf))
      .mockResolvedValueOnce(
        reply(200, {
          code: 200,
          message: 'Success',
          result: { authenticated: true, csrfToken: 'next', expiresInSeconds: 900 }
        })
      )
      .mockResolvedValueOnce(reply(200, { code: 200, message: 'Success', result: user }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(loadSession()).resolves.toMatchObject(user)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/users/me',
      '/api/v1/auth/csrf',
      '/api/v1/auth/refresh',
      '/api/v1/users/me'
    ])
    expect(fetchMock.mock.calls[2][1]).toMatchObject({
      headers: { 'X-XSRF-TOKEN': 'csrf-value', 'X-Client-Type': 'web' }
    })
  })

  it('treats rejected refresh as signed out, but preserves server failures', async () => {
    const signedOutFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(401, { code: 401 }))
      .mockResolvedValueOnce(reply(200, csrf))
      .mockResolvedValueOnce(reply(401, { code: 401 }))
    vi.stubGlobal('fetch', signedOutFetch)
    await expect(loadSession()).resolves.toBeNull()

    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reply(503, { code: 503 })))
    await expect(loadSession()).rejects.toMatchObject({ status: 503 })
  })

  it('sends a CSRF-protected logout request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(200, csrf))
      .mockResolvedValueOnce(reply(200, { code: 200, message: 'Success', result: null }))
    vi.stubGlobal('fetch', fetchMock)
    await signOut()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/auth/logout')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-value', 'X-Client-Type': 'web' }
    })
  })
})
