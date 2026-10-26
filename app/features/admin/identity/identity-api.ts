import {
  assignManagedUserRole,
  deleteManagedUser,
  getManagedUser,
  listManagedUsers,
  provisionUser,
  revokeManagedUserRole,
  setManagedUserStatus,
  updateManagedUser
} from '~/shared/api/generated/api/account/account'
import { createManagedRole, listManagedRoles, setManagedRolePermissions } from '~/shared/api/generated/api/role/role'
import { listManagedPermissions } from '~/shared/api/generated/api/permission/permission'
import type {
  CreateRoleRequest,
  ProvisionUserRequest,
  SetRolePermissionsRequest,
  UpdateProfileRequest
} from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/features/shared/auth/session-api'

function result<T>(response: { data: { code: number; result?: T } }): T {
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
  return response.data.result as T
}

const readOptions = { credentials: 'include' as const }
async function writeOptions() {
  return { credentials: 'include' as const, headers: await csrfHeaders() }
}

export async function fetchUsers(page: number, size: number) {
  const users = result(await listManagedUsers({ page, size }, readOptions))
  if (!users || !Array.isArray(users.content)) throw new Error('Invalid IdentityService user page')
  return users
}
export async function fetchUser(id: string) {
  return result(await getManagedUser(id, readOptions))
}
export async function addUser(request: ProvisionUserRequest) {
  return result(await provisionUser(request, await writeOptions()))
}
export async function saveUser(id: string, request: UpdateProfileRequest) {
  return result(await updateManagedUser(id, request, await writeOptions()))
}
export async function removeUser(id: string) {
  return result(await deleteManagedUser(id, await writeOptions()))
}
export async function changeUserStatus(id: string, status: 'ACTIVE' | 'LOCKED') {
  return result(await setManagedUserStatus(id, { status }, await writeOptions()))
}
export async function addUserRole(id: string, roleId: string) {
  return result(await assignManagedUserRole(id, roleId, await writeOptions()))
}
export async function removeUserRole(id: string, roleId: string) {
  return result(await revokeManagedUserRole(id, roleId, await writeOptions()))
}
export async function fetchRoles() {
  return result(await listManagedRoles(readOptions))
}
export async function addRole(request: CreateRoleRequest) {
  return result(await createManagedRole(request, await writeOptions()))
}
export async function saveRolePermissions(id: string, request: SetRolePermissionsRequest) {
  return result(await setManagedRolePermissions(id, request, await writeOptions()))
}
export async function fetchPermissions() {
  return result(await listManagedPermissions(readOptions))
}
