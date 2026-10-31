export const BUILT_IN_ROLES = ['ADMIN', 'CENTER_MANAGER', 'CAREGIVER', 'CUSTOMER'] as const
export type BuiltInRole = (typeof BUILT_IN_ROLES)[number]

export function isBuiltInRole(code: string | undefined): code is BuiltInRole {
  return BUILT_IN_ROLES.some((role) => role === code)
}
