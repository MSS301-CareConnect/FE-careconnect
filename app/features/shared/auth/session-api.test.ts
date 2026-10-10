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
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/auth/csrf', '/api/auth/login', '/api/users/me'])
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      method: 'POST',
      headers: { 'X-XSRF-TOKEN': 'csrf-value' }
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
      '/api/users/me',
      '/api/auth/csrf',
      '/api/auth/refresh',
      '/api/users/me'
    ])
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
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/logout')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-value' }
    })
  })
})
