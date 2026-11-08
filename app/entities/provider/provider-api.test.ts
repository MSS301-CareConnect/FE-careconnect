import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCenter,
  fetchCaregivers,
  fetchCenters,
  fetchCertificates,
  fetchWorkShifts,
  verifyCaregiver
} from './provider-api'

function reply(result: unknown): Response {
  return {
    status: 200,
    ok: true,
    text: async () => JSON.stringify({ code: 200, message: 'Success', result }),
    headers: new Headers()
  } as Response
}

afterEach(() => vi.unstubAllGlobals())

describe('Provider gateway API', () => {
  it('reads the four Provider groups through the gateway with cookies', async () => {
    const page = { items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(page))
      .mockResolvedValueOnce(reply(page))
      .mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply(page))
    vi.stubGlobal('fetch', fetchMock)

    await fetchCenters({ page: 0, size: 20 })
    await fetchCaregivers('center-1', { page: 0, size: 20 })
    await fetchCertificates('caregiver-1')
    await fetchWorkShifts({ centerId: 'center-1' })

    expect(fetchMock.mock.calls.map(([url]) => String(url).split('?')[0])).toEqual([
      '/api/v1/care-centers',
      '/api/v1/caregivers/centers/center-1',
      '/api/v1/certificates/caregivers/caregiver-1',
      '/api/v1/work-shifts'
    ])
    for (const [, options] of fetchMock.mock.calls)
      expect(options).toMatchObject({ credentials: 'include', method: 'GET' })
  })

  it('uses CSRF and the backend version for Provider mutations', async () => {
    const csrf = { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ id: 'center-1', centerName: 'Care One', centerStatus: 'PENDING', version: 1 }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(
        reply({
          id: 'caregiver-1',
          centerId: 'center-1',
          fullName: 'Lan',
          verificationStatus: 'VERIFIED',
          caregiverStatus: 'ACTIVE',
          version: 5
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    await createCenter({ centerName: 'Care One', email: 'center@example.com', address: 'Main Street' })
    await verifyCaregiver('caregiver-1', { status: 'VERIFIED', version: 4 })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/v1/auth/csrf',
      '/api/v1/care-centers',
      '/api/v1/auth/csrf',
      '/api/v1/caregivers/caregiver-1/verification'
    ])
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-token', 'X-Client-Type': 'web' }
    })
    expect(fetchMock.mock.calls[3][1]).toMatchObject({
      method: 'PATCH',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-token', 'X-Client-Type': 'web' }
    })
    expect(JSON.parse(String(fetchMock.mock.calls[3][1]?.body))).toEqual({ status: 'VERIFIED', version: 4 })
  })
})
