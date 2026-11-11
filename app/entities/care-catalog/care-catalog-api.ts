import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalogItems,
  updateCatalogItem,
  uploadCatalogItemImage
} from '~/shared/api/generated/api/catalog-item/catalog-item'
import { getCenterOffering, listCenterOfferings } from '~/shared/api/generated/api/center-offering/center-offering'
import {
  createCenterOffering,
  deleteCenterOffering,
  updateCenterOffering
} from '~/shared/api/generated/api/center-offering/center-offering'
import {
  createPricePlan,
  deletePricePlan,
  listPricePlans,
  listPricePlansPage,
  updatePricePlan,
  updatePricePlansBatch
} from '~/shared/api/generated/api/price-plan/price-plan'
import type {
  CatalogItemRecord,
  CatalogItemRequest,
  CenterOfferingRecord,
  CenterOfferingRequest,
  PricePlanBatchUpdateRequest,
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
  centerOfferingPage: (centerId: string, params: { keyword: string; page: number; size: number }) =>
    ['care-catalog', 'center-offerings', centerId, 'page', params] as const,
  pricePlans: (centerOfferingId: string) => ['care-catalog', 'price-plans', centerOfferingId] as const,
  pricePlanPage: (centerOfferingId: string, page: number, size: number) =>
    ['care-catalog', 'price-plans', centerOfferingId, 'page', page, size] as const
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
/**
 * Stores a cover image (JPG / PNG / WebP up to 5 MB) and returns its permanent catalog URL to send as `imageUrl`.
 * The URL is public and redirects to a short-lived download link, so it works directly in an <img>.
 */
export async function uploadCatalogImage(file: File) {
  return result(await uploadCatalogItemImage({ file }, await writeOptions()))
}
/** Soft-deletes the standard service; the backend keeps the row for existing center offerings. */
export async function removeCatalog(id: string) {
  success(await deleteCatalogItem(id, await writeOptions()))
}

export async function fetchCenterOfferings(centerId: string): Promise<CenterOfferingRecord[]> {
  return collectPages((page) => listCenterOfferings(centerId, { page, size: pageSize }, readOptions).then(result))
}
/** One page of a center's offerings for the managing side, optionally narrowed by service name (2026-11-11). */
export async function fetchCenterOfferingPage(
  centerId: string,
  params: { keyword: string; page: number; size: number }
) {
  const { keyword, page, size } = params
  return result(await listCenterOfferings(centerId, { keyword: keyword || undefined, page, size }, readOptions))
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
/** Soft delete; refused with 409 (3206) while the service still has an active price plan. Its plans go with it. */
export async function removeOffering(id: string) {
  success(await deleteCenterOffering(id, await writeOptions()))
}
export async function fetchPricePlans(centerOfferingId: string) {
  return result(await listPricePlans(centerOfferingId, readOptions))
}
/** One page of an offering's price plans, oldest first (the managing screen; 2026-11-11). */
export async function fetchPricePlanPage(centerOfferingId: string, page: number, size: number) {
  return result(await listPricePlansPage({ centerOfferingId, page, size }, readOptions))
}
export async function createOfferingPricePlan(request: PricePlanRequest) {
  return result(await createPricePlan(request, await writeOptions()))
}
export async function saveOfferingPricePlan(id: string, request: PricePlanRequest) {
  return result(await updatePricePlan(id, request, await writeOptions()))
}
/** Soft delete; bookings already made keep the price they were quoted. */
export async function removePricePlan(id: string) {
  success(await deletePricePlan(id, await writeOptions()))
}
/** All or nothing: one stale or invalid plan rejects the whole batch. */
export async function saveOfferingPricePlans(request: PricePlanBatchUpdateRequest) {
  return result(await updatePricePlansBatch(request, await writeOptions()))
}
