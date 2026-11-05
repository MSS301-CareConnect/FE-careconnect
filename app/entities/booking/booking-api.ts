import {
  acceptBooking,
  acceptBookingAsCaregiver,
  declineBookingAsCaregiver,
  getCaregiverBookingRequest,
  listCaregiverBookingRequests,
  updateBookingServiceAddress,
  cancelBooking,
  createBooking,
  getBooking,
  getBookingStatusCounts,
  listBookingHeldSchedules,
  listBookingHistory,
  listBookings,
  previewBookingCancellation,
  quoteBooking,
  rejectBooking,
  updateBookingCaregiver,
  updateBookingOccurrenceCaregiver
} from '~/shared/api/generated/api/booking/booking'
import {
  acknowledgeBookingOccurrence,
  decideBookingOccurrenceNoShow,
  getBookingOccurrence,
  listMyBookingOccurrences,
  reportBookingOccurrenceNoShow
} from '~/shared/api/generated/api/booking-occurrence/booking-occurrence'
import {
  createCareSessionTask,
  endCareSession,
  forceEndCareSession,
  getCareSession,
  startCareSession,
  updateCareSessionTask
} from '~/shared/api/generated/api/care-session/care-session'
import {
  getCenterBookingPolicy,
  updateCenterBookingPolicy
} from '~/shared/api/generated/api/center-booking-policy/center-booking-policy'
import type {
  BookingCancelRequest,
  BookingCreateRequest,
  BookingQuoteRequest,
  BookingSummaryRecord,
  CareSessionStartRequest,
  CareTaskUpdateRequest,
  CenterBookingPolicyRequest,
  ListBookingHeldSchedulesParams,
  ListBookingsParams,
  ListMyBookingOccurrencesParams,
  NoShowDecisionRequest,
  ServiceAddressRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async (headers: HeadersInit = {}) => ({
  credentials: 'include' as const,
  headers: { ...(await csrfHeaders()), ...headers }
})

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`BookingService returned code ${response.data.code}`)
  return response.data.result
}

/** HTTP status attached by the generated fetch client when the backend answered with an error. */
export function bookingErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

/** Application error code from the backend APIResponse body, such as 5226 CAREGIVER_NOT_AVAILABLE. */
export function bookingErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('code' in info)) return undefined
  return typeof info.code === 'number' ? info.code : undefined
}

export const bookingKeys = {
  all: ['booking'] as const,
  lists: ['booking', 'list'] as const,
  list: (params: ListBookingsParams) => ['booking', 'list', params] as const,
  collection: (params: Omit<ListBookingsParams, 'page' | 'size' | 'sort'>) =>
    ['booking', 'list', 'collection', params] as const,
  detail: (id: string) => ['booking', 'detail', id] as const,
  history: (id: string, page: number) => ['booking', 'history', id, page] as const,
  quote: (request: BookingQuoteRequest | null) => ['booking', 'quote', request] as const,
  occurrences: (params: ListMyBookingOccurrencesParams) => ['booking', 'occurrences', params] as const,
  occurrence: (id: string) => ['booking', 'occurrence', id] as const,
  session: (id: string) => ['booking', 'session', id] as const,
  heldSchedules: (params: ListBookingHeldSchedulesParams) => ['booking', 'held-schedules', params] as const,
  centerPolicy: (centerId: string) => ['booking', 'center-policy', centerId] as const,
  caregiverRequests: (page: number) => ['booking', 'caregiver-requests', page] as const,
  caregiverRequest: (id: string) => ['booking', 'caregiver-request', id] as const,
  statusCounts: (centerId?: string) => ['booking', 'status-counts', centerId ?? 'own'] as const
}

export async function fetchBookings(params: ListBookingsParams = {}) {
  return result(await listBookings(params, readOptions))
}

/** Center queue: bookings per status with the nearest deadline and how many are due soon or already overdue. */
export async function fetchBookingStatusCounts(centerId?: string) {
  return result(await getBookingStatusCounts(centerId ? { centerId } : undefined, readOptions))
}

const COLLECTION_PAGE_SIZE = 100
const COLLECTION_MAX_PAGES = 5

/**
 * Up to 500 bookings in pages of 100 (the BookingService maximum), newest first, so a screen can group several
 * statuses and count them; the list endpoint filters one status at a time. `truncated` says more exist.
 */
export async function fetchBookingCollection(params: Omit<ListBookingsParams, 'page' | 'size' | 'sort'> = {}) {
  const items: BookingSummaryRecord[] = []
  let totalElements = 0
  for (let page = 0; page < COLLECTION_MAX_PAGES; page += 1) {
    const chunk = await fetchBookings({ ...params, sort: 'createdAt,desc', page, size: COLLECTION_PAGE_SIZE })
    items.push(...chunk.items)
    totalElements = chunk.totalElements
    if (page + 1 >= chunk.totalPages) break
  }
  return { items, totalElements, truncated: totalElements > items.length }
}
/** Booking policy in effect for a center (spec §8): advance notice, deadlines, deposit and refund rules. */
export async function fetchCenterBookingPolicy(centerId: string) {
  return result(await getCenterBookingPolicy(centerId, readOptions))
}
/** Replaces a center's booking policy (CENTER_MANAGER own center, ADMIN any); `version` guards concurrent edits. */
export async function updateCenterBookingPolicyRequest(centerId: string, request: CenterBookingPolicyRequest) {
  return result(await updateCenterBookingPolicy(centerId, request, await writeOptions()))
}
/** Caregiver schedules already held by bookings, and the caregiver's busy slots, to lock them in the SHIFT picker. */
export async function fetchHeldSchedules(params: ListBookingHeldSchedulesParams) {
  return result(await listBookingHeldSchedules(params, readOptions))
}
export async function fetchBooking(id: string) {
  return result(await getBooking(id, readOptions))
}
export async function fetchBookingHistory(id: string, page = 0) {
  return result(await listBookingHistory(id, { page, size: 50 }, readOptions))
}
/** Prices every occurrence through CareCatalogService without writing; the client never sends a price. */
export async function fetchBookingQuote(request: BookingQuoteRequest) {
  return result(await quoteBooking(request, await writeOptions()))
}
/** The same Idempotency-Key returns the same booking when a submit is retried. */
export async function placeBooking(request: BookingCreateRequest, idempotencyKey: string) {
  return result(await createBooking(request, await writeOptions({ 'Idempotency-Key': idempotencyKey })))
}
export async function previewCancellation(id: string, occurrenceIds?: string[]) {
  return result(await previewBookingCancellation(id, { occurrenceIds }, await writeOptions()))
}
export async function cancelBookingRequest(id: string, request: BookingCancelRequest) {
  return result(await cancelBooking(id, request, await writeOptions()))
}
export async function acceptBookingRequest(id: string, caregiverId?: string) {
  return result(await acceptBooking(id, caregiverId ? { caregiverId } : {}, await writeOptions()))
}
export async function rejectBookingRequest(id: string, reason: string) {
  return result(await rejectBooking(id, { reason }, await writeOptions()))
}
export async function assignBookingCaregiver(id: string, caregiverId: string) {
  return result(await updateBookingCaregiver(id, { caregiverId }, await writeOptions()))
}
export async function assignOccurrenceCaregiver(id: string, occurrenceId: string, caregiverId: string) {
  return result(await updateBookingOccurrenceCaregiver(id, occurrenceId, { caregiverId }, await writeOptions()))
}

/** CR-2: the customer (own booking) or the center moves every upcoming visit to a new care address. */
export async function updateServiceAddressRequest(id: string, request: ServiceAddressRequest) {
  return result(await updateBookingServiceAddress(id, request, await writeOptions()))
}
/** CR-3: bookings a customer sent straight to this caregiver, waiting for an answer (area only, no care profile). */
export async function fetchCaregiverBookingRequests(page = 0) {
  return result(await listCaregiverBookingRequests({ page, size: 50 }, readOptions))
}
export async function fetchCaregiverBookingRequest(id: string) {
  return result(await getCaregiverBookingRequest(id, readOptions))
}
export async function acceptAsCaregiverRequest(id: string) {
  return result(await acceptBookingAsCaregiver(id, await writeOptions()))
}
export async function declineAsCaregiverRequest(id: string, reason: string) {
  return result(await declineBookingAsCaregiver(id, { reason }, await writeOptions()))
}

export async function fetchMyOccurrences(params: ListMyBookingOccurrencesParams = {}) {
  return result(await listMyBookingOccurrences(params, readOptions))
}
export async function fetchOccurrence(id: string) {
  return result(await getBookingOccurrence(id, readOptions))
}
export async function acknowledgeOccurrence(id: string) {
  return result(await acknowledgeBookingOccurrence(id, await writeOptions()))
}
export async function reportNoShow(id: string, note: string) {
  return result(await reportBookingOccurrenceNoShow(id, { note }, await writeOptions()))
}
export async function decideNoShow(id: string, request: NoShowDecisionRequest) {
  return result(await decideBookingOccurrenceNoShow(id, request, await writeOptions()))
}

export async function fetchCareSession(id: string) {
  return result(await getCareSession(id, readOptions))
}
export async function checkIn(request: CareSessionStartRequest) {
  return result(await startCareSession(request, await writeOptions()))
}
export async function checkOut(id: string, coordinates: { latitude?: number; longitude?: number } = {}) {
  return result(await endCareSession(id, coordinates, await writeOptions()))
}
export async function forceEndSession(id: string, reason: string) {
  return result(await forceEndCareSession(id, { reason }, await writeOptions()))
}
export async function addSessionTask(id: string, title: string) {
  return result(await createCareSessionTask(id, { title }, await writeOptions()))
}
export async function saveSessionTask(id: string, taskId: string, request: CareTaskUpdateRequest) {
  return result(await updateCareSessionTask(id, taskId, request, await writeOptions()))
}
