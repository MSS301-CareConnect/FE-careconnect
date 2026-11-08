import { describe, expect, it } from 'vitest'

import { serviceCategoryGroup, serviceCategoryValue } from './service-category'

describe('service categories', () => {
  it('reads current, legacy and unknown values into a group', () => {
    expect(serviceCategoryGroup('Người cao tuổi')).toBe('elderly')
    expect(serviceCategoryGroup(' chăm sóc SAU TAI BIẾN & đột quỵ ')).toBe('rehabilitation')
    expect(serviceCategoryGroup('Chăm sóc giảm nhẹ')).toBe('chronic')
    expect(serviceCategoryGroup('Dinh dưỡng')).toBe('other')
    expect(serviceCategoryGroup(undefined)).toBe('other')
  })

  it('stores the short Vietnamese value of a group', () => {
    expect(serviceCategoryValue('motherBaby')).toBe('Mẹ và bé')
  })
})
