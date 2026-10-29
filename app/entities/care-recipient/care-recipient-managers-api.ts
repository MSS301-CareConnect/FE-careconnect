import {
  acceptCareRecipientInvitation,
  declineCareRecipientInvitation,
  deleteCareRecipientManager,
  inviteCareRecipientManager,
  listCareRecipientInvitations,
  listCareRecipientManagers,
  listMyCareRecipientInvitations,
  revokeCareRecipientInvitation
} from '~/shared/api/generated/api/care-recipient/care-recipient'
import type { ManagerCreateRequest } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

import { careRecipientErrorCode } from './care-recipient-api'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`CareRecipientService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`CareRecipientService returned code ${response.data.code}`)
}

export const managerKeys = {
  managers: (recipientId: string) => ['care-recipient', 'managers', recipientId] as const,
  invitations: (recipientId: string) => ['care-recipient', 'invitations', recipientId] as const,
  myInvitations: ['care-recipient', 'my-invitations'] as const
}

export async function fetchManagers(recipientId: string) {
  return result(await listCareRecipientManagers(recipientId, readOptions))
}

export async function removeManager(recipientId: string, managerId: string) {
  success(await deleteCareRecipientManager(recipientId, managerId, await writeOptions()))
}

/** Primary OWNER's view: only the email they typed and the status — never whether the email has an account (C-04). */
export async function fetchInvitations(recipientId: string) {
  return result(await listCareRecipientInvitations(recipientId, readOptions))
}

export async function inviteManager(recipientId: string, request: ManagerCreateRequest) {
  return result(await inviteCareRecipientManager(recipientId, request, await writeOptions()))
}

export async function revokeInvitation(recipientId: string, invitationId: string) {
  success(await revokeCareRecipientInvitation(recipientId, invitationId, await writeOptions()))
}

export async function fetchMyInvitations() {
  return result(await listMyCareRecipientInvitations(readOptions))
}

export async function acceptInvitation(invitationId: string) {
  return result(await acceptCareRecipientInvitation(invitationId, await writeOptions()))
}

export async function declineInvitation(invitationId: string) {
  success(await declineCareRecipientInvitation(invitationId, await writeOptions()))
}

const KNOWN_CODES = [2402, 2408, 2410, 2411, 2412, 2413, 2414, 2405, 2403] as const
export type ManagerErrorKey =
  `customer.managers.errors.e${(typeof KNOWN_CODES)[number]}` | 'customer.managers.errors.generic'

export function managerErrorKey(error: unknown): ManagerErrorKey {
  const code = careRecipientErrorCode(error)
  const known = KNOWN_CODES.find((item) => item === code)
  return known ? `customer.managers.errors.e${known}` : 'customer.managers.errors.generic'
}
