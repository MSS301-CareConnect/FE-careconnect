import {
  archiveProviderCenter,
  createProviderCenter,
  getProviderCenter,
  getPublicProviderCenter,
  listProviderCenters,
  listPublicProviderCenters,
  setProviderCenterStatus,
  updateProviderCenter,
  listProviderCenterSchedules
} from '~/shared/api/generated/api/provider-center/provider-center'
import {
  archiveProviderCaregiver,
  createProviderCaregiver,
  getProviderCaregiver,
  listCenterCaregivers,
  listPendingVerificationProviderCaregivers,
  listProviderCaregiverTimeOffs,
  listProviderCaregiverServices,
  replaceProviderCaregiverServices,
  createProviderCaregiverTimeOff,
  deleteProviderCaregiverTimeOff,
  setProviderCaregiverStatus,
  updateProviderCaregiver,
  verifyProviderCaregiver,
  catalogProviderCaregivers,
  getMyProviderCaregiverProfile,
  getProviderCaregiverByUser,
  getPublicProviderCaregiver,
  searchProviderCaregivers,
  listMyProviderCaregiverSchedules,
  updateProviderCaregiverScheduleStatus
} from '~/shared/api/generated/api/provider-caregiver/provider-caregiver'
import {
  archiveProviderCertificate,
  createProviderCertificate,
  listProviderCertificates,
  updateProviderCertificate,
  verifyProviderCertificate,
  verifyProviderCertificateByCenter,
  listVerifiedProviderCertificates
} from '~/shared/api/generated/api/provider-certificate/provider-certificate'
import {
  archiveProviderWorkShift,
  createProviderWorkShift,
  getProviderWorkShift,
  listProviderShiftRegistrations,
  listProviderWorkShifts,
  reviewProviderShiftRegistration,
  updateProviderWorkShift,
  registerProviderShift,
  listMyProviderShiftRegistrations,
  cancelProviderShiftRegistration
} from '~/shared/api/generated/api/provider-work-shift/provider-work-shift'
import {
  listProviderMedia,
  uploadProviderMedia,
  deleteProviderMedia
} from '~/shared/api/generated/api/provider-media/provider-media'
import type {
  CaregiverCreateRequest,
  CaregiverUpdateRequest,
  CenterCreateRequest,
  CenterStatusUpdateRequest,
  CenterUpdateRequest,
  CaregiverStatusRequest,
  CertificateRequest,
  CertificateVerificationRequest,
  ListProviderCaregiverTimeOffsParams,
  TimeOffRequest,
  ListCenterCaregiversParams,
  ListPendingVerificationProviderCaregiversParams,
  ListProviderCentersParams,
  ListPublicProviderCentersParams,
  ListProviderWorkShiftsParams,
  RegistrationReviewRequest,
  VerificationRequest,
  WorkShiftRequest,
  CatalogProviderCaregiversParams,
  ListMyProviderCaregiverSchedulesParams,
  ListMyProviderShiftRegistrationsParams,
  ListProviderCenterSchedulesParams,
  ScheduleStatusRequest,
  SearchProviderCaregiversParams,
  ShiftRegistrationRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`ProviderService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`ProviderService returned code ${response.data.code}`)
}

export const providerKeys = {
  centers: ['provider', 'centers'] as const,
  publicCenters: ['provider', 'public-centers'] as const,
  publicCenter: (id: string) => ['provider', 'public-center', id] as const,
  center: (id: string) => ['provider', 'center', id] as const,
  caregivers: (centerId: string) => ['provider', 'caregivers', centerId] as const,
  caregiver: (id: string) => ['provider', 'caregiver', id] as const,
  pendingCaregivers: (page: number) => ['provider', 'pending-caregivers', page] as const,
  timeOffs: (caregiverId: string) => ['provider', 'time-offs', caregiverId] as const,
  caregiverServices: (caregiverId: string) => ['provider', 'caregiver-services', caregiverId] as const,
  publicCaregiver: (id: string) => ['provider', 'public-caregiver', id] as const,
  serviceCaregivers: (params: SearchProviderCaregiversParams) => ['provider', 'service-caregivers', params] as const,
  certificates: (id: string) => ['provider', 'certificates', id] as const,
  shifts: (centerId: string) => ['provider', 'shifts', centerId] as const,
  shift: (id: string) => ['provider', 'shift', id] as const,
  registrations: (id: string) => ['provider', 'registrations', id] as const,
  catalog: ['provider', 'catalog'] as const,
  myProfile: ['provider', 'my-profile'] as const,
  mySchedules: ['provider', 'my-schedules'] as const,
  centerSchedules: (id: string) => ['provider', 'center-schedules', id] as const,
  myRegistrations: ['provider', 'my-registrations'] as const,
  media: (ownerType: ProviderMediaOwner, ownerId: string) => ['provider', 'media', ownerType, ownerId] as const
}

export type ProviderMediaOwner = 'CARE_CENTER' | 'CAREGIVER_PROFILE' | 'CERTIFICATE'

export async function fetchCenters(params: ListProviderCentersParams = {}) {
  return result(await listProviderCenters(params, readOptions))
}
export async function fetchCenter(id: string) {
  return result(await getProviderCenter(id, readOptions))
}
/** Customer-facing ACTIVE centers (SRCH-02). */
export async function fetchPublicCenters(params: ListPublicProviderCentersParams = {}) {
  return result(await listPublicProviderCenters(params, readOptions))
}
export async function fetchPublicCenter(id: string) {
  return result(await getPublicProviderCenter(id, readOptions))
}
export async function createCenter(request: CenterCreateRequest) {
  return result(await createProviderCenter(request, await writeOptions()))
}
export async function saveCenter(id: string, request: CenterUpdateRequest) {
  return result(await updateProviderCenter(id, request, await writeOptions()))
}
export async function changeCenterStatus(id: string, request: CenterStatusUpdateRequest) {
  return result(await setProviderCenterStatus(id, request, await writeOptions()))
}
export async function removeCenter(id: string, version: number) {
  success(await archiveProviderCenter(id, { version }, await writeOptions()))
}

export async function fetchCaregivers(centerId: string, params: ListCenterCaregiversParams = {}) {
  return result(await listCenterCaregivers(centerId, params, readOptions))
}
/** ADMIN: caregivers of every center (or one center) waiting for verification (M-13). */
export async function fetchPendingCaregivers(params: ListPendingVerificationProviderCaregiversParams = {}) {
  return result(await listPendingVerificationProviderCaregivers(params, readOptions))
}
export async function fetchCaregiver(id: string) {
  return result(await getProviderCaregiver(id, readOptions))
}
export async function createCaregiver(centerId: string, request: CaregiverCreateRequest) {
  return result(await createProviderCaregiver(centerId, request, await writeOptions()))
}
export async function saveCaregiver(id: string, request: CaregiverUpdateRequest) {
  return result(await updateProviderCaregiver(id, request, await writeOptions()))
}
/** Status changes go through their own PATCH; the profile PUT has no status field (M-12). */
export async function changeCaregiverStatus(id: string, request: CaregiverStatusRequest) {
  return result(await setProviderCaregiverStatus(id, request, await writeOptions()))
}
/** Care services the center assigned to a caregiver (PRV-01); the booking skill check reads the same list. */
export async function fetchCaregiverServices(caregiverId: string) {
  return result(await listProviderCaregiverServices(caregiverId, readOptions))
}
/** Replaces every service assigned to a caregiver; ProviderService checks each belongs to the same center. */
export async function saveCaregiverServices(caregiverId: string, centerServiceIds: string[]) {
  return result(await replaceProviderCaregiverServices(caregiverId, { centerServiceIds }, await writeOptions()))
}
export async function fetchTimeOffs(caregiverId: string, params: ListProviderCaregiverTimeOffsParams = {}) {
  return result(await listProviderCaregiverTimeOffs(caregiverId, params, readOptions))
}
export async function createTimeOff(caregiverId: string, request: TimeOffRequest) {
  return result(await createProviderCaregiverTimeOff(caregiverId, request, await writeOptions()))
}
export async function removeTimeOff(caregiverId: string, timeOffId: string) {
  return success(await deleteProviderCaregiverTimeOff(caregiverId, timeOffId, await writeOptions()))
}
export async function verifyCaregiver(id: string, request: VerificationRequest) {
  return result(await verifyProviderCaregiver(id, request, await writeOptions()))
}
export async function removeCaregiver(id: string, version: number) {
  success(await archiveProviderCaregiver(id, { version }, await writeOptions()))
}

export async function fetchCertificates(caregiverId: string) {
  return result(await listProviderCertificates(caregiverId, readOptions))
}
export async function createCertificate(caregiverId: string, request: CertificateRequest) {
  return result(await createProviderCertificate(caregiverId, request, await writeOptions()))
}
export async function saveCertificate(id: string, request: CertificateRequest) {
  return result(await updateProviderCertificate(id, request, await writeOptions()))
}
/** Step 2: an admin approves a certificate the center already confirmed (CENTER_VERIFIED → ADMIN_VERIFIED). */
export async function verifyCertificate(id: string, request: CertificateVerificationRequest) {
  return result(await verifyProviderCertificate(id, request, await writeOptions()))
}
/** Step 1: the center manager confirms (or rejects) a PENDING certificate of their caregiver. */
export async function verifyCertificateByCenter(id: string, request: CertificateVerificationRequest) {
  return result(await verifyProviderCertificateByCenter(id, request, await writeOptions()))
}
export async function removeCertificate(id: string, version: number) {
  success(await archiveProviderCertificate(id, { version }, await writeOptions()))
}

export async function fetchWorkShifts(params: ListProviderWorkShiftsParams = {}) {
  return result(await listProviderWorkShifts(params, readOptions))
}
export async function fetchWorkShift(id: string) {
  return result(await getProviderWorkShift(id, readOptions))
}
export async function createWorkShift(centerId: string, request: WorkShiftRequest) {
  return result(await createProviderWorkShift(centerId, request, await writeOptions()))
}
export async function saveWorkShift(id: string, request: WorkShiftRequest) {
  return result(await updateProviderWorkShift(id, request, await writeOptions()))
}
export async function removeWorkShift(id: string, version: number) {
  success(await archiveProviderWorkShift(id, { version }, await writeOptions()))
}
export async function fetchShiftRegistrations(id: string, page = 0) {
  return result(await listProviderShiftRegistrations(id, { page }, readOptions))
}
export async function reviewShiftRegistration(id: string, request: RegistrationReviewRequest) {
  return result(await reviewProviderShiftRegistration(id, request, await writeOptions()))
}

export async function fetchCaregiverCatalog(params: CatalogProviderCaregiversParams = {}) {
  return result(await catalogProviderCaregivers(params, readOptions))
}
export async function fetchCaregiverByUser(userId: string) {
  return result(await getProviderCaregiverByUser(userId, readOptions))
}
/** Customer-facing profile (SRCH-01) with its services and verified certificates; no internal fields. */
export async function fetchPublicCaregiver(caregiverId: string) {
  return result(await getPublicProviderCaregiver(caregiverId, readOptions))
}
/** Caregivers of one center who provide every listed care service (SRCH-01). */
export async function searchCaregiversByService(params: SearchProviderCaregiversParams) {
  return result(await searchProviderCaregivers(params, readOptions))
}
export async function fetchVerifiedCertificates(caregiverId: string) {
  return result(await listVerifiedProviderCertificates(caregiverId, readOptions))
}
export async function fetchMyCaregiverProfile() {
  return result(await getMyProviderCaregiverProfile(readOptions))
}
export async function fetchMySchedules(params: ListMyProviderCaregiverSchedulesParams = {}) {
  return result(await listMyProviderCaregiverSchedules(params, readOptions))
}
export async function updateCaregiverSchedule(id: string, request: ScheduleStatusRequest) {
  return result(await updateProviderCaregiverScheduleStatus(id, request, await writeOptions()))
}
export async function fetchCenterSchedules(centerId: string, params: ListProviderCenterSchedulesParams = {}) {
  return result(await listProviderCenterSchedules(centerId, params, readOptions))
}
export async function registerForShift(id: string, request: ShiftRegistrationRequest) {
  return result(await registerProviderShift(id, request, await writeOptions()))
}
export async function fetchMyShiftRegistrations(params: ListMyProviderShiftRegistrationsParams = {}) {
  return result(await listMyProviderShiftRegistrations(params, readOptions))
}
export async function cancelMyShiftRegistration(id: string, version: number) {
  success(await cancelProviderShiftRegistration(id, { version }, await writeOptions()))
}
export async function fetchProviderMedia(ownerType: ProviderMediaOwner, ownerId: string) {
  return result(await listProviderMedia(ownerType, ownerId, readOptions))
}
export async function uploadMedia(ownerType: ProviderMediaOwner, ownerId: string, files: Blob[]) {
  return result(await uploadProviderMedia(ownerType, ownerId, { files }, await writeOptions()))
}
export async function removeMedia(ownerType: ProviderMediaOwner, ownerId: string, mediaFileId: string) {
  success(await deleteProviderMedia(ownerType, ownerId, mediaFileId, await writeOptions()))
}
