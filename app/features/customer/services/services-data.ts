import { careCatalogErrorStatus, fetchCenterOfferings, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { fetchCaregiverCatalog } from '~/entities/provider/provider-api'
import type { CatalogItemRecord, PricePlanRecord } from '~/shared/api/generated/contracts'

/** Customers cannot list centers, so centers are read from the active caregiver catalog. */
const CATALOG_PAGE_SIZE = 100
const MAX_CATALOG_PAGES = 5

export const SERVICE_SORTS = ['center', 'name', 'priceAsc', 'priceDesc'] as const
export type ServiceSort = (typeof SERVICE_SORTS)[number]

export type ServiceCenter = { id: string; name: string }

export type CustomerService = {
  /** Center offering ID, or the catalog item ID when no center offers the service yet. */
  id: string
  name: string
  category: string
  description?: string
  center?: ServiceCenter
  /** Active price plans, cheapest first. */
  plans: PricePlanRecord[]
}

export async function fetchServiceCenters(): Promise<ServiceCenter[]> {
  const centers = new Map<string, string>()
  for (let page = 0; page < MAX_CATALOG_PAGES; page += 1) {
    const result = await fetchCaregiverCatalog({ page, size: CATALOG_PAGE_SIZE })
    for (const caregiver of result.items)
      if (caregiver.centerId && !centers.has(caregiver.centerId))
        centers.set(caregiver.centerId, caregiver.centerName ?? caregiver.centerId)
    if (page + 1 >= result.totalPages) break
  }
  return [...centers].map(([id, name]) => ({ id, name }))
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

/** Active catalog items that no loaded center offers yet, so new services are visible too. */
export function unofferedServices(items: readonly CatalogItemRecord[], offered: readonly CustomerService[]) {
  const offeredNames = new Set(offered.map((service) => `${service.name}\u0000${service.category}`))
  return items
    .filter((item) => item.status === 'ACTIVE' && !offeredNames.has(`${item.name}\u0000${item.category}`))
    .map<CustomerService>((item) => ({
      id: item.id,
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

/** Services without a center or a price always sort last. */
export function sortServices(services: readonly CustomerService[], sort: ServiceSort) {
  return [...services].sort((a, b) => {
    const primary =
      sort === 'center'
        ? compareText(a.center?.name, b.center?.name)
        : sort === 'name'
          ? 0
          : comparePrice(lowestPrice(a), lowestPrice(b), sort === 'priceAsc' ? 1 : -1)
    return primary || compareText(a.name, b.name)
  })
}

/** Lowercases and strips Vietnamese diacritics so "cham soc" matches "Chăm sóc". */
export function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase()
}
