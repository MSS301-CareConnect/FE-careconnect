import { describe, expect, it } from 'vitest'

import {
  EMPTY_CATALOG_ITEM,
  fieldErrorsFromServerCode,
  toCatalogItemRequest,
  validateCatalogItem
} from '../catalog-item-form'

describe('catalog item form', () => {
  it('requires a trimmed name and category', () => {
    expect(validateCatalogItem({ ...EMPTY_CATALOG_ITEM, name: '   ', category: '' })).toEqual({
      name: 'nameRequired',
      category: 'categoryRequired'
    })
  })

  it('enforces the backend column limits', () => {
    expect(
      validateCatalogItem({
        name: 'a'.repeat(256),
        category: 'b'.repeat(256),
        description: 'c'.repeat(1001),
        status: ''
      })
    ).toEqual({
      name: 'nameTooLong',
      category: 'categoryTooLong',
      description: 'descriptionTooLong',
      status: 'statusRequired'
    })
  })

  it('maps the draft to the POST contract and omits an empty description', () => {
    expect(
      toCatalogItemRequest({ name: ' Elder care ', category: ' Elderly ', description: '  ', status: 'ACTIVE' })
    ).toEqual({ name: 'Elder care', category: 'Elderly', status: 'ACTIVE' })
    expect(
      toCatalogItemRequest({ name: 'A', category: 'B', description: ' Home visits ', status: 'INACTIVE' })
    ).toEqual({ name: 'A', category: 'B', description: 'Home visits', status: 'INACTIVE' })
  })

  it('maps only field-specific backend codes to field errors', () => {
    expect(fieldErrorsFromServerCode(3101)).toEqual({ name: 'nameRequired' })
    expect(fieldErrorsFromServerCode(3102)).toEqual({ category: 'categoryRequired' })
    expect(fieldErrorsFromServerCode(3103)).toEqual({ status: 'statusRequired' })
    expect(fieldErrorsFromServerCode(3000)).toBeUndefined()
    expect(fieldErrorsFromServerCode(undefined)).toBeUndefined()
  })
})
