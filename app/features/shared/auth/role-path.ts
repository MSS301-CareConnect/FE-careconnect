import type { UserResponse } from '~/shared/api/generated/contracts'

export type PortalRole = 'ADMIN' | 'CENTER_MANAGER' | 'CAREGIVER' | 'CUSTOMER'

const portalPaths: Record<PortalRole, string> = {
  ADMIN: '/admin/dashboard',
  CENTER_MANAGER: '/center-manager/caregivers',
  CAREGIVER: '/caregiver/visits',
  CUSTOMER: '/customer'
}

export function homeForUser(user: UserResponse): string | null {
  if (user.status !== 'ACTIVE') return null
  const role = (Object.keys(portalPaths) as PortalRole[]).find((candidate) => user.roles?.includes(candidate))
  return role ? portalPaths[role] : null
}

export function safeReturnPath(value: string | null, user: UserResponse): string | null {
  if (user.status !== 'ACTIVE') return null
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  const role = (Object.keys(portalPaths) as PortalRole[]).find((candidate) => {
    const basePath = portalPaths[candidate].split('/').slice(0, 2).join('/')
    return user.roles?.includes(candidate) && (value === basePath || value.startsWith(basePath + '/'))
  })
  return role ? value : null
}
