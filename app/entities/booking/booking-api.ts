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
  acknowledgeBookingOccurrences,
  decideBookingOccurrenceNoShow,
  getBookingOccurrence,
  listMyBookingOccurrences,
  reportBookingOccurrenceByCustomer,
  reportBookingOccurrenceNoShow
} from '~/shared/api/generated/api/booking-occurrence/booking-occurrence'
import {
  createCareSessionTask,
  endCareSession,
  forceEndCareSession,
  listCareSessionsForReview,
  reviewCareSession,
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
  CaregiverOccurrenceRecord,
  CareSessionStartRequest,
  CareTaskUpdateRequest,
  CenterBookingPolicyRequest,
  ListBookingHeldSchedulesParams,
  ListBookingsParams,
  ListMyBookingOccurrencesParams,
  NoShowDecisionRequest,
  ServiceAddressRequest
} from '~/shared/api/generated/contracts'
import {
  createCaregiverWithdrawals,
  listCaregiverWithdrawals
} from '~/shared/api/generated/api/caregiver-withdrawal/caregiver-withdrawal'
import {
  concludeCaregiverAbsence,
  explainCaregiverAbsence,
  getCaregiverAbsenceStatistics,
  listCaregiverAbsences
} from '~/shared/api/generated/api/caregiver-absence/caregiver-absence'
import type {
  CaregiverAbsenceConclusionRequest,
  CaregiverAbsenceExplanationRequest,
  GetCaregiverAbsenceStatisticsParams,
  ListCaregiverAbsencesParams,
  CaregiverWithdrawalRequest,
  ListCaregiverWithdrawalsParams
} from '~/shared/api/generated/contracts'
import { apiErrorCode, apiErrorStatus } from '~/shared/api/error-details'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'
import { env } from '~/shared/config/env'
import { syncServerClock } from '~/shared/lib/server-clock'

const { result } = serviceResponse('BookingService')

/** HTTP status attached by the generated fetch client when the backend answered with an error. */
export function bookingErrorStatus(error: unknown): number | undefined {
  return apiErrorStatus(error)
}

/** Application error code from the backend APIResponse body, such as 5226 CAREGIVER_NOT_AVAILABLE. */
export function bookingErrorCode(error: unknown): number | undefined {
  return apiErrorCode(error)
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
  statusCounts: (centerId?: string) => ['booking', 'status-counts', centerId ?? 'own'] as const,
  withdrawals: (params: ListCaregiverWithdrawalsParams) => ['booking', 'withdrawals', params] as const,
  /** Prefix of every absence list and count: invalidate it after an explanation or a conclusion. */
  /** System-closed sessions waiting for the center's conclusion. */
  sessionReviews: (page: number, size: number) => ['booking', 'session-reviews', page, size] as const,
  unassigned: (page: number, size: number) => ['booking', 'unassigned', page, size] as const,
  allAbsences: ['booking', 'absences'] as const,
  absences: (params: ListCaregiverAbsencesParams) => ['booking', 'absences', 'list', params] as const,
  absenceStatistics: (params: GetCaregiverAbsenceStatisticsParams) =>
    ['booking', 'absences', 'statistics', params] as const
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
  const booking = result(await getBooking(id, readOptions))
  // The 5-minute hold countdown runs on server time (2026-11-09).
  syncServerClock(booking.serverTime)
  return booking
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
  const booking = result(await createBooking(request, await writeOptions({ 'Idempotency-Key': idempotencyKey })))
  syncServerClock(booking.serverTime)
  return booking
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
export async function fetchCaregiverBookingRequests(page = 0, size = 50) {
  return result(await listCaregiverBookingRequests({ page, size }, readOptions))
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

/**
 * 2026-11-09: a caregiver withdraws from visits of one booking (each > 24 h ahead) with a reason; the center — or the
 * automatic assignment — gives them to another caregiver. Managers read their center's queue, caregivers their own.
 */
export async function fetchCaregiverWithdrawals(params: ListCaregiverWithdrawalsParams = {}) {
  return result(await listCaregiverWithdrawals(params, readOptions))
}
export async function withdrawFromVisits(request: CaregiverWithdrawalRequest) {
  return result(await createCaregiverWithdrawals(request, await writeOptions()))
}

/**
 * 2026-11-10: a visit nobody checked in to becomes CAREGIVER_MISSED (the customer is refunded in full) and opens an
 * absence record. The caregiver explains, the center manager concludes; BookingService scopes the lists by role.
 */
export async function fetchCaregiverAbsences(params: ListCaregiverAbsencesParams = {}) {
  return result(await listCaregiverAbsences(params, readOptions))
}
export async function fetchCaregiverAbsenceStatistics(params: GetCaregiverAbsenceStatisticsParams = {}) {
  return result(await getCaregiverAbsenceStatistics(params, readOptions))
}
export async function explainAbsence(id: string, request: CaregiverAbsenceExplanationRequest) {
  return result(await explainCaregiverAbsence(id, request, await writeOptions()))
}
export async function concludeAbsence(id: string, request: CaregiverAbsenceConclusionRequest) {
  return result(await concludeCaregiverAbsence(id, request, await writeOptions()))
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
/** Accepts several assigned visits of one booking at once (2026-11-10); all or nothing. */
export async function acknowledgeOccurrences(occurrenceIds: string[]) {
  return result(await acknowledgeBookingOccurrences({ occurrenceIds }, await writeOptions()))
}
export async function reportNoShow(id: string, note: string) {
  return result(await reportBookingOccurrenceNoShow(id, { note }, await writeOptions()))
}
export async function reportVisitByCustomer(occurrenceId: string, note?: string) {
  return result(await reportBookingOccurrenceByCustomer(occurrenceId, { note }, await writeOptions()))
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
/** Sessions the system closed (nobody checked out) that the center has not concluded yet, oldest visit first. */
export async function fetchSessionsForReview(page = 0, size = 20) {
  return result(await listCareSessionsForReview({ review: 'PENDING', page, size }, readOptions))
}
export async function reviewSession(id: string, request: { delivered: boolean; note?: string }) {
  return result(await reviewCareSession(id, request, await writeOptions()))
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

// ─── SPEC V3: CAREGIVER CHANGE REQUESTS ──────────────────────────────────────

export interface CaregiverChangeRequestRecord {
  id: string
  bookingId: string
  customerUserId: string
  centerId: string
  scopeType: 'ALL_REMAINING' | 'SPECIFIC_OCCURRENCES' | 'FROM_DATE'
  fromDate?: string
  reasonCode: 'SKILL_MISMATCH' | 'ATTITUDE_ISSUE' | 'PUNCTUALITY_ISSUE' | 'PERSONAL_PREFERENCE' | 'OTHER'
  reasonDetail?: string
  preferredCaregiverId?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  createdAt: string
  occurrences: Array<{ occurrenceId: string; occurrenceNo: number; startAt: string; endAt: string }>
}

export interface CaregiverChangeCreatePayload {
  scopeType: 'ALL_REMAINING' | 'SPECIFIC_OCCURRENCES' | 'FROM_DATE'
  occurrenceIds?: string[]
  fromDate?: string
  reasonCode: 'SKILL_MISMATCH' | 'ATTITUDE_ISSUE' | 'PUNCTUALITY_ISSUE' | 'PERSONAL_PREFERENCE' | 'OTHER'
  reasonDetail?: string
  preferredCaregiverId?: string
}

/** Rejects like the generated client: an Error carrying the HTTP status and the response envelope as `info`. */
async function requestError(res: Response, fallback: string) {
  const info: unknown = await res.json().catch(() => ({}))
  const message =
    typeof info === 'object' && info !== null && 'message' in info && typeof info.message === 'string'
      ? info.message
      : fallback
  return Object.assign(new Error(message), { info, status: res.status })
}

/** Paid visits of the manager's center that still need a caregiver, earliest first (2026-11-13). */
export async function fetchUnassignedVisits(page = 0, size = 5) {
  const res = await fetch(
    `${env.API_BASE_URL}/v1/booking-occurrences/unassigned?page=${page}&size=${size}`,
    readOptions
  )
  if (!res.ok) throw await requestError(res, 'Failed to load visits without a caregiver')
  const json = await res.json()
  return json.result as { items: CaregiverOccurrenceRecord[]; totalElements: number; totalPages: number }
}

/** The center records the check-in of a caregiver who forgot to press it (2026-11-13); `checkedInAt` = arrival. */
export async function centerCheckIn(request: { occurrenceId: string; note: string; checkedInAt?: string }) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/care-sessions/center-check-in`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(request)
  })
  if (!res.ok) throw await requestError(res, 'Failed to record the check-in')
  return true
}

export async function createCaregiverChangeRequest(bookingId: string, payload: CaregiverChangeCreatePayload) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/bookings/${bookingId}/caregiver-change-requests`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to create caregiver change request')
  const json = await res.json()
  return json.result as CaregiverChangeRequestRecord
}

export async function fetchBookingCaregiverChangeRequests(bookingId: string) {
  const res = await fetch(`${env.API_BASE_URL}/v1/bookings/${bookingId}/caregiver-change-requests`, readOptions)
  if (!res.ok) return []
  const json = await res.json()
  return (json.result || []) as CaregiverChangeRequestRecord[]
}

export async function cancelCaregiverChangeRequest(requestId: string) {
  const options = await writeOptions()
  const res = await fetch(`${env.API_BASE_URL}/v1/caregiver-change-requests/${requestId}`, {
    ...options,
    method: 'DELETE'
  })
  if (!res.ok) throw await requestError(res, 'Failed to cancel request')
  return true
}

export async function approveCaregiverChangeRequest(
  requestId: string,
  payload: { newCaregiverId: string; note?: string }
) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/caregiver-change-requests/${requestId}/approve`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to approve request')
  const json = await res.json()
  return json.result as CaregiverChangeRequestRecord
}

export async function rejectCaregiverChangeRequest(requestId: string, reason: string) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/caregiver-change-requests/${requestId}/reject`, {
    ...options,
    method: 'POST',
    body: JSON.stringify({ reason })
  })
  if (!res.ok) throw await requestError(res, 'Failed to reject request')
  const json = await res.json()
  return json.result as CaregiverChangeRequestRecord
}

// ─── SPEC V3: EMERGENCY REASSIGNMENT & REPLACEMENT CONSENT ────────────────────

export async function emergencyReassignBooking(
  bookingId: string,
  payload: { occurrenceIds: string[]; newCaregiverId: string; reason: string }
) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/bookings/${bookingId}/emergency-reassignment`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to emergency reassign')
  return true
}

export async function submitReplacementConsent(
  occurrenceId: string,
  payload: { action: 'ACCEPT' | 'RESCHEDULE' | 'REJECT_AND_CANCEL'; newStartAt?: string; newEndAt?: string }
) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/booking-occurrences/${occurrenceId}/replacement-consent`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to submit replacement consent')
  return true
}

// ─── SPEC V3: RESCHEDULE OCCURRENCE ──────────────────────────────────────────

export interface OccurrenceRescheduleResponseRecord {
  occurrenceId: string
  bookingId: string
  originalStartAt: string
  originalEndAt: string
  newStartAt: string
  newEndAt: string
  rescheduleCount: number
  available: boolean
  message: string
}

export async function previewRescheduleOccurrence(
  occurrenceId: string,
  payload: { newStartAt: string; newEndAt: string }
) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/booking-occurrences/${occurrenceId}/reschedule-preview`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to preview reschedule')
  const json = await res.json()
  return json.result as OccurrenceRescheduleResponseRecord
}

export async function rescheduleBookingOccurrence(
  occurrenceId: string,
  payload: { newStartAt: string; newEndAt: string; reason?: string }
) {
  const options = await writeOptions({ 'Content-Type': 'application/json' })
  const res = await fetch(`${env.API_BASE_URL}/v1/booking-occurrences/${occurrenceId}/reschedule`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw await requestError(res, 'Failed to reschedule occurrence')
  const json = await res.json()
  return json.result as OccurrenceRescheduleResponseRecord
}
