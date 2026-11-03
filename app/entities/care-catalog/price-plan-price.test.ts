import { describe, expect, it } from 'vitest'

import { discountedPrice, planPrice } from './price-plan-price'

describe('price plan discount', () => {
  it('rounds the discounted price to the dong like CareCatalogService', () => {
    expect(discountedPrice(99999, 15)).toBe(84999)
    expect(discountedPrice(100000, 0)).toBe(100000)
  })

  it('prefers the backend final price and falls back to computing it', () => {
    expect(planPrice({ basePrice: 400000, discountPercent: 15, finalPrice: 340000 })).toEqual({
      basePrice: 400000,
      discountPercent: 15,
      finalPrice: 340000
    })
    expect(planPrice({ basePrice: 400000 }).finalPrice).toBe(400000)
  })
})
