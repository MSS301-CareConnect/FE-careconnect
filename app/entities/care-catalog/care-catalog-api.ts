import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalogItems,
  updateCatalogItem
} from '~/shared/api/generated/api/catalog-item/catalog-item'
import { getCenterOffering, listCenterOfferings } from '~/shared/api/generated/api/center-offering/center-offering'
import { createCenterOffering, updateCenterOffering } from '~/shared/api/generated/api/center-offering/center-offering'
import { createPricePlan, listPricePlans, updatePricePlan } from '~/shared/api/generated/api/price-plan/price-plan'
import type {
  CatalogItemRecord,
  CatalogItemRequest,
  CenterOfferingRecord,
  CenterOfferingRequest,
  PricePlanRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'
import { apiErrorCode, apiErrorStatus } from '~/shared/api/error-details'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })
const pageSize = 100

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`CareCatalogService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`CareCatalogService returned code ${response.data.code}`)
}

async function collectPages<T>(load: (page: number) => Promise<{ items: T[]; totalPages: number }>): Promise<T[]> {
  const items: T[] = []
  for (let page = 0; ; page += 1) {
    const result = await load(page)
    items.push(...result.items)
    if (page + 1 >= result.totalPages) return items
  }
}

/** HTTP status attached by the generated fetch client when the backend answered with an error. */
export function careCatalogErrorStatus(error: unknown): number | undefined {
  return apiErrorStatus(error)
}

/** Application error code from the backend APIResponse body, such as 3101 CARE_SERVICE_NAME_REQUIRED. */
export function careCatalogErrorCode(error: unknown): number | undefined {
  return apiErrorCode(error)
}

export const careCatalogKeys = {
  all: ['care-catalog'] as const,
  items: ['care-catalog', 'items'] as const,
  centerOfferings: (centerId: string) => ['care-catalog', 'center-offerings', centerId] as const,
  centerOffering: (id: string) => ['care-catalog', 'center-offering', id] as const,
  pricePlans: (centerOfferingId: string) => ['care-catalog', 'price-plans', centerOfferingId] as const
}

/** Collect every page because the current service screens filter the complete catalog locally. */
export async function fetchCatalogItems(): Promise<CatalogItemRecord[]> {
  return collectPages((page) => listCatalogItems({ page, size: pageSize }, readOptions).then(result))
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

export async function fetchCenterOfferings(centerId: string): Promise<CenterOfferingRecord[]> {
  return collectPages((page) => listCenterOfferings(centerId, { page, size: pageSize }, readOptions).then(result))
}
/** One offering; customers only see it while it is sellable, otherwise the backend answers 404. */
export async function fetchCenterOffering(id: string): Promise<CenterOfferingRecord> {
  return result(await getCenterOffering(id, readOptions))
}
export async function createOffering(request: CenterOfferingRequest) {
  return result(await createCenterOffering(request, await writeOptions()))
}
export async function saveOffering(id: string, request: CenterOfferingRequest) {
  return result(await updateCenterOffering(id, request, await writeOptions()))
}
export async function fetchPricePlans(centerOfferingId: string) {
  return result(await listPricePlans(centerOfferingId, readOptions))
}
export async function createOfferingPricePlan(request: PricePlanRequest) {
  return result(await createPricePlan(request, await writeOptions()))
}
export async function saveOfferingPricePlan(id: string, request: PricePlanRequest) {
  return result(await updatePricePlan(id, request, await writeOptions()))
}
