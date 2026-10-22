import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalogItems,
  updateCatalogItem
} from '~/shared/api/generated/api/catalog-item/catalog-item'
import { listCenterOfferings } from '~/shared/api/generated/api/center-offering/center-offering'
import { listPricePlans } from '~/shared/api/generated/api/price-plan/price-plan'
import type { CatalogItemRequest } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`CareCatalogService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`CareCatalogService returned code ${response.data.code}`)
}

/** HTTP status attached by the generated fetch client when the backend answered with an error. */
export function careCatalogErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

/** Application error code from the backend APIResponse body, such as 3101 CARE_SERVICE_NAME_REQUIRED. */
export function careCatalogErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('code' in info)) return undefined
  return typeof info.code === 'number' ? info.code : undefined
}

export const careCatalogKeys = {
  all: ['care-catalog'] as const,
  items: ['care-catalog', 'items'] as const,
  centerOfferings: (centerId: string) => ['care-catalog', 'center-offerings', centerId] as const,
  pricePlans: (centerOfferingId: string) => ['care-catalog', 'price-plans', centerOfferingId] as const
}

/** The backend returns the whole non-deleted catalog; it has no server-side pagination. */
export async function fetchCatalogItems() {
  return result(await listCatalogItems(readOptions))
}
export async function createCatalog(request: CatalogItemRequest) {
  return result(await createCatalogItem(request, await writeOptions()))
}
export async function saveCatalog(id: string, request: CatalogItemRequest) {
  return result(await updateCatalogItem(id, request, await writeOptions()))
}
/** Soft-deletes the standard service; the backend keeps the row for existing center offerings. */
export async function removeCatalog(id: string) {
  success(await deleteCatalogItem(id, await writeOptions()))
}

export async function fetchCenterOfferings(centerId: string) {
  return result(await listCenterOfferings(centerId, readOptions))
}
export async function fetchPricePlans(centerOfferingId: string) {
  return result(await listPricePlans(centerOfferingId, readOptions))
}
