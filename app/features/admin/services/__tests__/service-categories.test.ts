import { describe, expect, it } from 'vitest'

import { mergeCategoryOptions } from '../service-categories'
import { STANDARD_SERVICE_CATEGORIES } from '../service-category.constants'

describe('service category options', () => {
  it('lists the standard categories first and appends stored ones without duplicates', () => {
    const options = mergeCategoryOptions([
      'Phục hồi chức năng',
      ' chăm sóc người cao tuổi ',
      'An dưỡng',
      'phục hồi chức năng',
      '   '
    ])

    expect(options.slice(0, STANDARD_SERVICE_CATEGORIES.length)).toEqual(
      STANDARD_SERVICE_CATEGORIES.map(({ key, value }) => ({ value, standardKey: key }))
    )
    expect(options.slice(STANDARD_SERVICE_CATEGORIES.length)).toEqual([
      { value: 'An dưỡng' },
      { value: 'Phục hồi chức năng' }
    ])
  })
})
