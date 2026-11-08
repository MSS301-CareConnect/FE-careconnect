import {
  getManagedUser,
  getUserStatistics,
  listManagedUsers,
  provisionUser,
  setManagedUserStatus
} from '~/shared/api/generated/api/account/account'
import type { ListManagedUsersParams, ProvisionUserRequest } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

const readOptions = { credentials: 'include' as const }
async function writeOptions() {
  return { credentials: 'include' as const, headers: await csrfHeaders() }
}

function result<T>(response: { data: { code: number; result?: T } }): T {
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
  return response.data.result as T
}

/** Every account query sits under `['identity', 'users']`, so one invalidation refreshes lists, pickers and stats. */
export const accountKeys = {
  all: ['identity', 'users'] as const,
  list: (params: ListManagedUsersParams) => ['identity', 'users', 'list', params] as const,
  statistics: ['identity', 'users', 'statistics'] as const,
  detail: (id: string) => ['identity', 'user', id] as const
}

/** IdentityService filters, searches and pages on the server (`role`, `status`, `centerId`, `keyword`, `sort`). */
export async function fetchAccounts(params: ListManagedUsersParams) {
  const users = result(await listManagedUsers(params, readOptions))
  if (!users || !Array.isArray(users.content)) throw new Error('Invalid IdentityService user page')
  return users
}

export async function fetchAccount(id: string) {
  return result(await getManagedUser(id, readOptions))
}

/** Platform-wide counts by role and status (ADMIN). */
export async function fetchAccountStatistics() {
  return result(await getUserStatistics({}, readOptions))
}

export async function provisionAccount(request: ProvisionUserRequest) {
  return result(await provisionUser(request, await writeOptions()))
}

/** Locking needs a reason (LOCK_REASON_REQUIRED 1118); unlocking does not. */
export async function changeAccountStatus(id: string, status: 'ACTIVE' | 'LOCKED', reason?: string) {
  return result(await setManagedUserStatus(id, { status, reason: reason || undefined }, await writeOptions()))
}
