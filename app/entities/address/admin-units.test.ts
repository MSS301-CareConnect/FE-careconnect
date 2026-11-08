import { describe, expect, it } from 'vitest'

import {
  addressIssues,
  findProvince,
  findWard,
  joinAddress,
  normalizeAddress,
  splitAddressText,
  splitUnitName
} from './admin-units'
import { VN_PROVINCES } from './vn-admin-units.constants'

const hanoi = VN_PROVINCES.find((province) => province.code === 1)!

describe('Vietnamese two-level administrative units', () => {
  it('holds the 34 provinces and 3,321 wards in force since 01/07/2025', () => {
    expect(VN_PROVINCES).toHaveLength(34)
    expect(VN_PROVINCES.reduce((sum, province) => sum + province.wards.length, 0)).toBe(3321)
  })

  it('matches provinces by short, informal and pre-2025 names', () => {
    expect(findProvince(VN_PROVINCES, 'Hà Nội')).toEqual({ province: hanoi, merged: false })
    expect(findProvince(VN_PROVINCES, 'TP. Hồ Chí Minh')?.province.code).toBe(79)
    expect(findProvince(VN_PROVINCES, 'TP.HCM')?.province.code).toBe(79)
    expect(findProvince(VN_PROVINCES, 'tinh thanh hoa')?.province.code).toBe(38)
    expect(findProvince(VN_PROVINCES, 'Bình Dương')).toEqual({
      province: expect.objectContaining({ name: 'Thành phố Hồ Chí Minh' }),
      merged: true
    })
    expect(findProvince(VN_PROVINCES, 'Tỉnh Bà Rịa - Vũng Tàu')?.province.code).toBe(79)
    expect(findProvince(VN_PROVINCES, 'Atlantis')).toBeUndefined()
  })

  it('matches wards with or without their type', () => {
    expect(findWard(hanoi, 'Ba Đình')).toBe('Phường Ba Đình')
    expect(findWard(hanoi, 'P. Ba Đình')).toBe('Phường Ba Đình')
    expect(findWard(hanoi, 'Phường Kim Mã')).toBeUndefined()
    expect(splitUnitName('Phường Ba Đình')).toEqual({ type: 'Phường', name: 'Ba Đình' })
    expect(splitUnitName('Đặc khu Phú Quốc')).toEqual({ type: 'Đặc khu', name: 'Phú Quốc' })
  })

  it('reports missing parts and names that are no longer in the list', () => {
    expect(addressIssues({ addressLine: '', ward: '', province: '' }, VN_PROVINCES, { optional: true })).toEqual({})
    expect(addressIssues({ addressLine: '', ward: '', province: '' }, VN_PROVINCES)).toEqual({
      addressLine: 'required',
      ward: 'required',
      province: 'required'
    })
    expect(
      addressIssues({ addressLine: '45 Kim Mã', ward: 'Phường Kim Mã', province: 'Hà Nội' }, VN_PROVINCES)
    ).toEqual({ ward: 'outdated' })
    expect(addressIssues({ addressLine: '1 A', ward: 'Phường X', province: 'Hà Tây cũ' }, VN_PROVINCES)).toEqual({
      province: 'outdated',
      ward: 'outdated'
    })
    // Without the list only missing parts count.
    expect(addressIssues({ addressLine: '1 A', ward: 'Phường X', province: 'Y' }, undefined)).toEqual({})
  })

  it('writes official names and joins a one-line address', () => {
    const parts = normalizeAddress({ addressLine: ' 2 Lê Lợi ', ward: 'ba dinh', province: 'Hà Nội' }, VN_PROVINCES)
    expect(parts).toEqual({ addressLine: '2 Lê Lợi', ward: 'Phường Ba Đình', province: 'Thành phố Hà Nội' })
    expect(joinAddress(parts)).toBe('2 Lê Lợi, Phường Ba Đình, Thành phố Hà Nội')
  })

  it('reads a one-line address back, keeping unknown parts in the street line', () => {
    expect(splitAddressText('2 Lê Lợi, Phường Ba Đình, Thành phố Hà Nội', VN_PROVINCES)).toEqual({
      addressLine: '2 Lê Lợi',
      ward: 'Phường Ba Đình',
      province: 'Thành phố Hà Nội'
    })
    expect(splitAddressText('12 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', VN_PROVINCES)).toEqual({
      addressLine: '12 Lê Lợi',
      ward: 'Phường Bến Thành',
      province: 'Thành phố Hồ Chí Minh'
    })
    expect(splitAddressText('45 Kim Mã, Phường Kim Mã, Quận Ba Đình, Hà Nội', VN_PROVINCES)).toEqual({
      addressLine: '45 Kim Mã, Phường Kim Mã, Quận Ba Đình',
      ward: '',
      province: 'Thành phố Hà Nội'
    })
    expect(splitAddressText('1 Lê Lợi', VN_PROVINCES)).toEqual({ addressLine: '1 Lê Lợi', ward: '', province: '' })
  })
})
