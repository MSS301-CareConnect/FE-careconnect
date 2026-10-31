import { afterEach, describe, expect, it, vi } from 'vitest'

import { confirmPasswordReset, sendPasswordResetCode } from './password-recovery-api'

function reply(data: unknown): Response {
  return { status: 200, ok: true, text: async () => JSON.stringify(data), headers: new Headers() } as Response
}

afterEach(() => vi.unstubAllGlobals())

describe('password recovery through the gateway', () => {
  it('uses the current auth endpoints with a fresh CSRF token for each request', async () => {
    const csrf = { code: 200, message: 'Success', result: { token: 'csrf-value', headerName: 'X-XSRF-TOKEN' } }
    const success = { code: 200, message: 'Success', result: null }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(success))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(success))
    vi.stubGlobal('fetch', fetchMock)

    await sendPasswordResetCode({ email: 'family@example.com' })
    await confirmPasswordReset({ email: 'family@example.com', otpCode: '123456', newPassword: 'Secret123!' })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/auth/csrf',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/csrf',
      '/api/v1/auth/reset-password'
    ])
    for (const index of [1, 3]) {
      expect(fetchMock.mock.calls[index][1]).toMatchObject({
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': 'csrf-value', 'X-Client-Type': 'web' }
      })
    }
  })
})
