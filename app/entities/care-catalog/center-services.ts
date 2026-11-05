import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import type { PricePlanRecord } from '~/shared/api/generated/contracts'

import { careCatalogErrorStatus, fetchCenterOfferings, fetchPricePlans } from './care-catalog-api'
import { planPrice } from './price-plan-price'

/** A service as customers browse it: one center offering with its prices, or a catalog item before a center is chosen. */
export type CenterService = {
  /** Center offering ID, or the catalog item ID for the platform-wide configuration. */
  id: string
  /** Catalog item (care service) ID that a booking request references. */
  catalogItemId: string
  name: string
  category: string
  description?: string
  imageUrl?: string
  center?: ServiceCenter
  /** Active price plans, cheapest first. */
  plans: PricePlanRecord[]
}

/** A center or offering with nothing registered yet is empty, not a failure. */
async function emptyWhenNotFound<T>(request: Promise<T[]>): Promise<T[]> {
  try {
    return await request
  } catch (error) {
    if (careCatalogErrorStatus(error) === 404) return []
    throw error
  }
}

/**
 * Active offerings of one center with their active price plans. Shared by the services list and the center page
 * (CR-6, 2026-11-03).
 */
export async function fetchCenterServices(center: ServiceCenter): Promise<CenterService[]> {
  const offerings = (await emptyWhenNotFound(fetchCenterOfferings(center.id))).filter(
    (offering) => offering.status === 'ACTIVE' && offering.catalogItem.status === 'ACTIVE'
  )
  return Promise.all(
    offerings.map(async (offering) => ({
      id: offering.id,
      catalogItemId: offering.catalogItem.id,
      name: offering.catalogItem.name,
      category: offering.catalogItem.category,
      description: offering.description || offering.catalogItem.description,
      imageUrl: offering.catalogItem.imageUrl,
      center,
      plans: (await emptyWhenNotFound(fetchPricePlans(offering.id)))
        .filter((plan) => plan.isActive !== false)
        .sort((a, b) => planPrice(a).finalPrice - planPrice(b).finalPrice)
    }))
  )
}
