import { careCatalogErrorStatus, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import type { CatalogItemRecord, PricePlanRecord } from '~/shared/api/generated/contracts'

export const SERVICE_SORTS = ['name', 'priceAsc', 'priceDesc'] as const
export type ServiceSort = (typeof SERVICE_SORTS)[number]

export type CustomerService = {
  /** Center offering ID, or the catalog item ID for the platform-wide configuration. */
  id: string
  /** Catalog item (care service) ID that a booking request references. */
  catalogItemId: string
  name: string
  category: string
  description?: string
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

/** Active offerings of one center with their active price plans. */
export async function fetchCenterServices(center: ServiceCenter): Promise<CustomerService[]> {
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
      center,
      plans: (await emptyWhenNotFound(fetchPricePlans(offering.id)))
        .filter((plan) => plan.isActive !== false)
        .sort((a, b) => a.basePrice - b.basePrice)
    }))
  )
}

/** Active catalog items as the platform-wide configuration; prices exist only per center. */
export function catalogServices(items: readonly CatalogItemRecord[]) {
  return items
    .filter((item) => item.status === 'ACTIVE')
    .map<CustomerService>((item) => ({
      id: item.id,
      catalogItemId: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      plans: []
    }))
}

export function lowestPrice(service: CustomerService): number | undefined {
  return service.plans[0]?.basePrice
}

function compareText(a: string | undefined, b: string | undefined) {
  if (a === b) return 0
  if (a === undefined) return 1
  if (b === undefined) return -1
  return a.localeCompare(b, 'vi')
}

function comparePrice(a: number | undefined, b: number | undefined, direction: 1 | -1) {
  if (a === b) return 0
  if (a === undefined) return 1
  if (b === undefined) return -1
  return (a - b) * direction
}

/** Services without a price always sort last. */
export function sortServices(services: readonly CustomerService[], sort: ServiceSort) {
  return [...services].sort((a, b) => {
    const primary = sort === 'name' ? 0 : comparePrice(lowestPrice(a), lowestPrice(b), sort === 'priceAsc' ? 1 : -1)
    return primary || compareText(a.name, b.name)
  })
}

/** Lowercases and strips Vietnamese diacritics so "cham soc" matches "Chăm sóc". */
export function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase()
}
