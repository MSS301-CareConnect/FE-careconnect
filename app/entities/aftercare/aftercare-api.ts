import {
  createCareReport,
  listCareReports,
  submitCareReport,
  updateCareReport
} from '~/shared/api/generated/api/care-report/care-report'
import { createCareSessionNote, listCareSessionNotes } from '~/shared/api/generated/api/care-session/care-session'
import {
  acceptComplaint,
  adminResolveComplaint,
  createComplaint,
  escalateComplaint,
  listComplaints,
  resolveComplaint,
  withdrawComplaint
} from '~/shared/api/generated/api/complaint/complaint'
import { createFeedback, listEligibleFeedbackCaregivers } from '~/shared/api/generated/api/feedback/feedback'
import type {
  CareReportRequest,
  ComplaintAdminResolutionRequest,
  ComplaintRequest,
  ComplaintStatus,
  FeedbackRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })
const PAGE = { page: 0, size: 50 }

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`BookingService returned code ${response.data.code}`)
  return response.data.result
}

export const aftercareKeys = {
  reports: (bookingId: string) => ['aftercare', 'reports', bookingId] as const,
  notes: (sessionId: string) => ['aftercare', 'notes', sessionId] as const,
  eligible: (bookingId: string) => ['aftercare', 'eligible', bookingId] as const,
  complaints: (status: string) => ['aftercare', 'complaints', status] as const,
  complaintsAll: ['aftercare', 'complaints'] as const
}

// ===== care reports (H-04) =====

/** Reports of a booking; BookingService already hides drafts from everyone except their caregiver (M-01). */
export async function fetchReports(bookingId: string) {
  return result(await listCareReports({ bookingId, ...PAGE }, readOptions)).items ?? []
}

export async function saveReport(id: string | undefined, request: CareReportRequest) {
  return id
    ? result(await updateCareReport(id, request, await writeOptions()))
    : result(await createCareReport(request, await writeOptions()))
}

export async function submitReport(id: string) {
  return result(await submitCareReport(id, await writeOptions()))
}

// ===== session notes (M-17) =====

export async function fetchSessionNotes(sessionId: string) {
  return result(await listCareSessionNotes(sessionId, PAGE, readOptions)).items ?? []
}

export async function addSessionNote(sessionId: string, content: string) {
  return result(await createCareSessionNote(sessionId, { content }, await writeOptions()))
}

// ===== feedback & complaints (H-05) =====

export async function fetchEligibleCaregivers(bookingId: string) {
  return result(await listEligibleFeedbackCaregivers({ bookingId }, readOptions))
}

export async function sendFeedback(request: FeedbackRequest) {
  return result(await createFeedback(request, await writeOptions()))
}

/** BookingService scopes the list to the caller: own complaints, own center, or every escalated case for admins. */
export async function fetchComplaints(status?: ComplaintStatus) {
  return result(await listComplaints({ status, ...PAGE }, readOptions)).items ?? []
}

export async function openComplaint(request: ComplaintRequest) {
  return result(await createComplaint(request, await writeOptions()))
}

export async function escalate(id: string, reason: string) {
  return result(await escalateComplaint(id, { reason }, await writeOptions()))
}

/** D20: the customer withdraws a complaint that is still being handled. */
export async function withdraw(id: string) {
  return result(await withdrawComplaint(id, await writeOptions()))
}

export async function accept(id: string) {
  return result(await acceptComplaint(id, await writeOptions()))
}

export async function resolve(id: string, resolution: string) {
  return result(await resolveComplaint(id, { resolution }, await writeOptions()))
}

export async function adminResolve(id: string, request: ComplaintAdminResolutionRequest) {
  return result(await adminResolveComplaint(id, request, await writeOptions()))
}

// D20 complaint rules and M-09 refund cap: codes with their own message.
const KNOWN_ERROR_CODES = [5923, 5926, 5927, 5928] as const

/** HTTP 4xx / 5xx from BookingService mapped to a short translated message. */
export function aftercareErrorKey(error: unknown) {
  const info = typeof error === 'object' && error !== null && 'info' in error ? error.info : undefined
  const code =
    typeof info === 'object' && info !== null && 'code' in info && typeof info.code === 'number' ? info.code : undefined
  const known = KNOWN_ERROR_CODES.find((item) => item === code)
  if (known) return `aftercare.errors.e${known}` as const
  const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined
  if (status === 403) return 'aftercare.errors.forbidden' as const
  if (status === 409) return 'aftercare.errors.conflict' as const
  if (status === 400) return 'aftercare.errors.invalid' as const
  return 'aftercare.errors.generic' as const
}
