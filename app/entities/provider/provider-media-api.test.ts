import { afterEach, describe, expect, it, vi } from 'vitest'

import { uploadMedia } from './provider-api'
import { csrfHeaders } from '~/shared/api/csrf'

vi.mock('~/shared/api/csrf', () => ({ csrfHeaders: vi.fn() }))

afterEach(() => vi.unstubAllGlobals())

describe('Provider media gateway upload', () => {
  it('sends files as multipart data with cookie credentials and CSRF', async () => {
    vi.mocked(csrfHeaders).mockResolvedValue({ 'X-CSRF-TOKEN': 'csrf-test', 'X-Client-Type': 'web' })
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 200, result: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['sample'], 'caregiver.png', { type: 'image/png' })

    await uploadMedia('CAREGIVER_PROFILE', 'caregiver-1', [file])

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/provider-media/CAREGIVER_PROFILE/caregiver-1')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
    expect(options.headers).toEqual({ 'X-CSRF-TOKEN': 'csrf-test', 'X-Client-Type': 'web' })
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('files')).toBe(file)
  })
})
