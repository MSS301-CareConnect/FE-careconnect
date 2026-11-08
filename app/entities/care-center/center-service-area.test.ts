import { describe, expect, it } from 'vitest'

import { VN_PROVINCES } from '~/entities/address/vn-admin-units.constants'
import { getCenterProvinceName, isCenterInServiceArea } from './center-service-area'

describe('isCenterInServiceArea', () => {
  it('returns true when center and recipient are in the same province (Ha Noi)', () => {
    expect(isCenterInServiceArea('45 Kim Mã, Ba Đình, Hà Nội', 'Thành phố Hà Nội', VN_PROVINCES)).toBe(true)
    expect(isCenterInServiceArea('45 Kim Mã, Ba Đình, TP Hà Nội', 'Hà Nội', VN_PROVINCES)).toBe(true)
  })

  it('returns true when center and recipient are in the same province (Ho Chi Minh)', () => {
    expect(
      isCenterInServiceArea(
        '1 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh',
        'Thành phố Hồ Chí Minh',
        VN_PROVINCES
      )
    ).toBe(true)
    expect(isCenterInServiceArea('Quận 1, Sài Gòn', 'Hồ Chí Minh', VN_PROVINCES)).toBe(true)
  })

  it('returns false when center and recipient are in different provinces', () => {
    expect(isCenterInServiceArea('45 Kim Mã, Ba Đình, Hà Nội', 'Thành phố Hồ Chí Minh', VN_PROVINCES)).toBe(false)
    expect(
      isCenterInServiceArea(
        '1 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh',
        'Thành phố Hà Nội',
        VN_PROVINCES
      )
    ).toBe(false)
  })

  it('falls back gracefully when address or province is missing', () => {
    expect(isCenterInServiceArea(undefined, 'Thành phố Hà Nội', VN_PROVINCES)).toBe(true)
    expect(isCenterInServiceArea('45 Kim Mã, Hà Nội', undefined, VN_PROVINCES)).toBe(true)
    expect(isCenterInServiceArea('45 Kim Mã, Hà Nội', 'Hà Nội', undefined)).toBe(true)
  })
})

describe('getCenterProvinceName', () => {
  it('extracts province name correctly', () => {
    expect(getCenterProvinceName('45 Kim Mã, Ba Đình, Hà Nội', VN_PROVINCES)).toBe('Thành phố Hà Nội')
    expect(
      getCenterProvinceName('1 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh', VN_PROVINCES)
    ).toBe('Thành phố Hồ Chí Minh')
  })
})
