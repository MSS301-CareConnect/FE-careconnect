import {
  archiveProviderCenter,
  createProviderCenter,
  getProviderCenter,
  listProviderCenters,
  setProviderCenterStatus,
  updateProviderCenter,
  listProviderCenterSchedules
} from '~/shared/api/generated/api/provider-center/provider-center'
import {
  archiveProviderCaregiver,
  createProviderCaregiver,
  getProviderCaregiver,
  listCenterCaregivers,
  updateProviderCaregiver,
  verifyProviderCaregiver,
  catalogProviderCaregivers,
  getMyProviderCaregiverProfile,
  getProviderCaregiverByUser,
  listMyProviderCaregiverSchedules,
  updateProviderCaregiverScheduleStatus
} from '~/shared/api/generated/api/provider-caregiver/provider-caregiver'
import {
  archiveProviderCertificate,
  createProviderCertificate,
  listProviderCertificates,
  updateProviderCertificate,
  verifyProviderCertificate,
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
  CertificateRequest,
  ListCenterCaregiversParams,
  ListProviderCentersParams,
  ListProviderWorkShiftsParams,
  RegistrationReviewRequest,
  VerificationRequest,
  WorkShiftRequest,
  CatalogProviderCaregiversParams,
  ListMyProviderCaregiverSchedulesParams,
  ListMyProviderShiftRegistrationsParams,
  ListProviderCenterSchedulesParams,
  ScheduleStatusRequest,
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
  center: (id: string) => ['provider', 'center', id] as const,
  caregivers: (centerId: string) => ['provider', 'caregivers', centerId] as const,
  caregiver: (id: string) => ['provider', 'caregiver', id] as const,
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
export async function fetchCaregiver(id: string) {
  return result(await getProviderCaregiver(id, readOptions))
}
export async function createCaregiver(centerId: string, request: CaregiverCreateRequest) {
  return result(await createProviderCaregiver(centerId, request, await writeOptions()))
}
export async function saveCaregiver(id: string, request: CaregiverUpdateRequest) {
  return result(await updateProviderCaregiver(id, request, await writeOptions()))
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
export async function verifyCertificate(id: string, request: VerificationRequest) {
  return result(await verifyProviderCertificate(id, request, await writeOptions()))
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
