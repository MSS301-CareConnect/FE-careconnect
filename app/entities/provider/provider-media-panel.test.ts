import { describe, expect, it } from 'vitest'

import { validateProviderFiles } from './provider-media-panel'

const file = (type: string, size: number) => new File([new Uint8Array(size)], 'upload', { type })

describe('Provider media file selection', () => {
  it('accepts images for profiles and centers within the MediaService limit', () => {
    expect(validateProviderFiles('CAREGIVER_PROFILE', [file('image/webp', 5 * 1024 * 1024)])).toBeNull()
    expect(validateProviderFiles('CARE_CENTER', [file('image/png', 5 * 1024 * 1024 + 1)])).toBe('size')
    expect(validateProviderFiles('CARE_CENTER', [file('application/pdf', 1)])).toBe('type')
  })

  it('accepts PDF certificates but rejects WebP and batches over ten files', () => {
    expect(validateProviderFiles('CERTIFICATE', [file('application/pdf', 1)])).toBeNull()
    expect(validateProviderFiles('CERTIFICATE', [file('image/webp', 1)])).toBe('type')
    expect(
      validateProviderFiles(
        'CERTIFICATE',
        Array.from({ length: 11 }, () => file('image/png', 1))
      )
    ).toBe('count')
  })
})
