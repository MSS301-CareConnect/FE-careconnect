import {
  assignPrimaryCareRecipientEmergencyContact,
  createCareRecipient,
  createCareRecipientAddress,
  createCareRecipientEmergencyContact,
  createCareRecipientMedication,
  deleteCareRecipient,
  deleteCareRecipientAddress,
  deleteCareRecipientEmergencyContact,
  deleteCareRecipientMedication,
  getCareRecipient,
  listCareRecipients,
  setCareRecipientMedicationActive,
  updateCareRecipient,
  listCareRecipientAddresses,
  updateCareRecipientAddress,
  updateCareRecipientEmergencyContact,
  updateCareRecipientMedication
} from '~/shared/api/generated/api/care-recipient/care-recipient'
import type {
  CareRecipientCreateRequest,
  CareRecipientUpdateRequest,
  EmergencyContactRequest,
  ListCareRecipientsParams,
  MedicationRequest,
  RecipientAddressRecord,
  RecipientAddressRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`CareRecipientService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`CareRecipientService returned code ${response.data.code}`)
}

/** HTTP status attached by the generated fetch client when the backend answered with an error. */
export function careRecipientErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

/** Application error code from the backend APIResponse body, such as 2104 FULLNAME_REQUIRED. */
export function careRecipientErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('code' in info)) return undefined
  return typeof info.code === 'number' ? info.code : undefined
}

export const careRecipientKeys = {
  all: ['care-recipient'] as const,
  list: (params: ListCareRecipientsParams) => ['care-recipient', 'list', params] as const,
  detail: (id: string) => ['care-recipient', 'detail', id] as const,
  addresses: (id: string) => ['care-recipient', 'addresses', id] as const
}

export async function fetchCareRecipients(params: ListCareRecipientsParams = {}) {
  return result(await listCareRecipients(params, readOptions))
}
export async function fetchCareRecipient(id: string) {
  return result(await getCareRecipient(id, readOptions))
}
/** Creates the profile with its medications and emergency contacts in one backend transaction. */
export async function createRecipientProfile(request: CareRecipientCreateRequest) {
  return result(await createCareRecipient(request, await writeOptions()))
}
export async function saveCareRecipient(id: string, request: CareRecipientUpdateRequest) {
  return result(await updateCareRecipient(id, request, await writeOptions()))
}
export async function archiveCareRecipient(id: string) {
  success(await deleteCareRecipient(id, await writeOptions()))
}

export async function createMedication(recipientId: string, request: MedicationRequest) {
  return result(await createCareRecipientMedication(recipientId, request, await writeOptions()))
}
export async function saveMedication(recipientId: string, medicationId: string, request: MedicationRequest) {
  return result(await updateCareRecipientMedication(recipientId, medicationId, request, await writeOptions()))
}
export async function setMedicationActive(recipientId: string, medicationId: string, active: boolean) {
  return result(await setCareRecipientMedicationActive(recipientId, medicationId, { active }, await writeOptions()))
}
export async function removeMedication(recipientId: string, medicationId: string) {
  success(await deleteCareRecipientMedication(recipientId, medicationId, await writeOptions()))
}

export async function createEmergencyContact(recipientId: string, request: EmergencyContactRequest) {
  return result(await createCareRecipientEmergencyContact(recipientId, request, await writeOptions()))
}
export async function saveEmergencyContact(recipientId: string, contactId: string, request: EmergencyContactRequest) {
  return result(await updateCareRecipientEmergencyContact(recipientId, contactId, request, await writeOptions()))
}
export async function makePrimaryEmergencyContact(recipientId: string, contactId: string) {
  return result(await assignPrimaryCareRecipientEmergencyContact(recipientId, contactId, await writeOptions()))
}
export async function removeEmergencyContact(recipientId: string, contactId: string) {
  success(await deleteCareRecipientEmergencyContact(recipientId, contactId, await writeOptions()))
}

/** Saved addresses of a care recipient (2026-11-05): picked when booking or when moving some visits elsewhere. */
export async function fetchRecipientAddresses(recipientId: string) {
  return result(await listCareRecipientAddresses(recipientId, readOptions))
}
export async function createRecipientAddress(recipientId: string, request: RecipientAddressRequest) {
  return result(await createCareRecipientAddress(recipientId, request, await writeOptions()))
}
export async function saveRecipientAddress(recipientId: string, addressId: string, request: RecipientAddressRequest) {
  return result(await updateCareRecipientAddress(recipientId, addressId, request, await writeOptions()))
}
export async function removeRecipientAddress(recipientId: string, addressId: string) {
  success(await deleteCareRecipientAddress(recipientId, addressId, await writeOptions()))
}

/** "9 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh" — the same joining BookingService uses for a care address. */
export function formatRecipientAddress(
  address: Pick<RecipientAddressRecord, 'addressLine' | 'ward' | 'district' | 'province'>
) {
  return [address.addressLine, address.ward, address.district, address.province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}
