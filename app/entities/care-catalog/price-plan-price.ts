import type { PricePlanRecord } from '~/shared/api/generated/contracts'

/** Price after a whole-percent discount, rounded to the dong like CareCatalogService (HALF_UP). */
export function discountedPrice(basePrice: number, discountPercent = 0) {
  return Math.round((basePrice * (100 - discountPercent)) / 100)
}

/** What the customer pays for one unit of the plan, and the list price shown struck through when discounted. */
export function planPrice(plan: Pick<PricePlanRecord, 'basePrice' | 'discountPercent' | 'finalPrice'>) {
  const discountPercent = plan.discountPercent ?? 0
  return {
    basePrice: plan.basePrice,
    discountPercent,
    finalPrice: plan.finalPrice ?? discountedPrice(plan.basePrice, discountPercent)
  }
}
