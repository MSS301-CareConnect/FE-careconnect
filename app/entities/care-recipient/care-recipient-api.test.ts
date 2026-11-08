import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  archiveCareRecipient,
  careRecipientErrorCode,
  createMedication,
  createRecipientProfile,
  fetchCareRecipient,
  fetchCareRecipients,
  saveCareRecipient,
  setMedicationActive
} from './care-recipient-api'
import { ageFromBirthDate } from './care-recipient-format'

function reply(result: unknown, code = 200): Response {
  return {
    status: 200,
    ok: true,
    text: async () => JSON.stringify({ code, message: 'Success', result }),
    headers: new Headers()
  } as Response
}

const csrf = { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }

afterEach(() => vi.unstubAllGlobals())

describe('CareRecipient gateway API', () => {
  it('reads profiles through the gateway with cookies', async () => {
    const page = { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(page))
      .mockResolvedValueOnce(reply({ profile: { id: 'rec-1', fullName: 'Lan', status: 'ACTIVE', version: 0 } }))
    vi.stubGlobal('fetch', fetchMock)

    await fetchCareRecipients({ keyword: 'Lan', status: 'ACTIVE', page: 0, size: 10 })
    await fetchCareRecipient('rec-1')

    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/v1/care-recipients?keyword=Lan&status=ACTIVE&page=0&size=10')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/care-recipients/rec-1')
    for (const [, options] of fetchMock.mock.calls)
      expect(options).toMatchObject({ credentials: 'include', method: 'GET' })
  })

  it('sends CSRF headers with every mutation', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ id: 'rec-1', fullName: 'Lan', status: 'ACTIVE', version: 3 }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ id: 'med-1', medicationName: 'A', startDate: '2026-10-01', active: true }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply({ id: 'med-1', medicationName: 'A', startDate: '2026-10-01', active: false }))
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(reply(null))
    vi.stubGlobal('fetch', fetchMock)

    await saveCareRecipient('rec-1', { fullName: 'Lan', version: 2 })
    await createMedication('rec-1', { medicationName: 'A', startDate: '2026-10-01' })
    await setMedicationActive('rec-1', 'med-1', false)
    await archiveCareRecipient('rec-1')

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/v1/auth/csrf',
      '/api/v1/care-recipients/rec-1',
      '/api/v1/auth/csrf',
      '/api/v1/care-recipients/rec-1/medications',
      '/api/v1/auth/csrf',
      '/api/v1/care-recipients/rec-1/medications/med-1/active?active=false',
      '/api/v1/auth/csrf',
      '/api/v1/care-recipients/rec-1'
    ])
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'PUT',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-token', 'X-Client-Type': 'web' }
    })
    expect(fetchMock.mock.calls[7][1]).toMatchObject({ method: 'DELETE' })
  })

  it('creates a profile with embedded medications in one CSRF-protected POST', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(reply(csrf))
      .mockResolvedValueOnce(
        reply({ profile: { id: 'rec-9', fullName: 'Lan', status: 'ACTIVE', version: 0 }, myAccessLevel: 'OWNER' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const created = await createRecipientProfile({
      fullName: 'Lan',
      relationshipType: 'CHILD',
      medications: [{ medicationName: 'A', startDate: '2026-10-01' }]
    })

    expect(created.profile.id).toBe('rec-9')
    expect(String(fetchMock.mock.calls[1][0])).toBe('/api/v1/care-recipients')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-token', 'X-Client-Type': 'web' })
    })
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toMatchObject({
      relationshipType: 'CHILD',
      medications: [{ medicationName: 'A', startDate: '2026-10-01' }]
    })
  })

  it('reads the application error code the generated client attaches to failures', () => {
    expect(careRecipientErrorCode(Object.assign(new Error(), { status: 400, info: { code: 2104 } }))).toBe(2104)
    expect(careRecipientErrorCode(Object.assign(new Error(), { status: 500, info: {} }))).toBeUndefined()
    expect(careRecipientErrorCode(new Error('offline'))).toBeUndefined()
  })

  it('rejects a non-success application code', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValueOnce(reply(null, 2101)))

    await expect(fetchCareRecipient('rec-1')).rejects.toThrow('CareRecipientService returned code 2101')
  })
})

describe('ageFromBirthDate', () => {
  it('counts whole years before and after the birthday', () => {
    const today = new Date('2026-10-22T00:00:00Z')
    expect(ageFromBirthDate('1950-10-22', today)).toBe(76)
    expect(ageFromBirthDate('1950-10-23', today)).toBe(75)
    expect(ageFromBirthDate(undefined, today)).toBeUndefined()
  })
})
