import {
  assignManagedUserRole,
  deleteManagedUser,
  revokeManagedUserRole,
  updateManagedUser
} from '~/shared/api/generated/api/account/account'
import {
  createManagedRole,
  deleteManagedRole,
  listManagedRoles,
  setManagedRolePermissions,
  updateManagedRole
} from '~/shared/api/generated/api/role/role'
import { listManagedPermissions } from '~/shared/api/generated/api/permission/permission'
import type {
  CreateRoleRequest,
  SetRolePermissionsRequest,
  UpdateRoleRequest,
  UpdateProfileRequest
} from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'

const { result } = serviceResponse('IdentityService')

export const roleKeys = {
  roles: ['identity', 'roles'] as const,
  permissions: ['identity', 'permissions'] as const
}

export async function saveUser(id: string, request: UpdateProfileRequest) {
  return result(await updateManagedUser(id, request, await writeOptions()))
}
/** IdentityService soft delete: the account leaves every list and can no longer sign in. */
export async function removeUser(id: string) {
  return result(await deleteManagedUser(id, await writeOptions()))
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
/** Custom roles only: name, description and whether the role still grants anything. */
export async function saveRole(id: string, request: UpdateRoleRequest) {
  return result(await updateManagedRole(id, request, await writeOptions()))
}
/** Soft delete; IdentityService answers 409 (1120) while an account still holds the role. */
export async function removeRole(id: string) {
  return result(await deleteManagedRole(id, await writeOptions()))
}
export async function saveRolePermissions(id: string, request: SetRolePermissionsRequest) {
  return result(await setManagedRolePermissions(id, request, await writeOptions()))
}
export async function fetchPermissions() {
  return result(await listManagedPermissions(readOptions))
}
