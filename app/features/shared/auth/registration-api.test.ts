import { afterEach, describe, expect, it, vi } from 'vitest'

import { beginRegistration, resendOtp, verifyRegistration } from './registration-api'

function reply(data: unknown): Response {
  return { status: 200, ok: true, text: async () => JSON.stringify(data), headers: new Headers() } as Response
}

afterEach(() => vi.unstubAllGlobals())

describe('registration API', () => {
  it('uses the generated endpoints and a fresh CSRF token for each registration step', async () => {
    const otp = { email: 'family@example.com', expiresInSeconds: 300, resendAfterSeconds: 60 }
    const csrf = { code: 200, message: 'Success', result: { token: 'csrf-value', headerName: 'X-XSRF-TOKEN' } }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ code: 200, message: 'Sent', result: otp }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ code: 200, message: 'Sent', result: otp }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ code: 200, message: 'Verified', result: { id: 'u-1' } }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      beginRegistration({ fullName: 'Family Member', email: otp.email, password: 'Secret123!' })
    ).resolves.toEqual(otp)
    await expect(resendOtp({ email: otp.email })).resolves.toEqual(otp)
    await expect(verifyRegistration({ email: otp.email, otpCode: '123456' })).resolves.toBeUndefined()

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth/csrf',
      '/api/users/register',
      '/api/auth/csrf',
      '/api/users/register/resend-otp',
      '/api/auth/csrf',
      '/api/users/register/verify'
    ])
    for (const index of [1, 3, 5]) {
      expect(fetchMock.mock.calls[index][1]).toMatchObject({
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': 'csrf-value' }
      })
    }
  })
})
