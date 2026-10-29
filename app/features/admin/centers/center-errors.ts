import { apiErrorCode } from '~/shared/api/error-details'

/** ProviderService codes about a center's manager, shown as plain sentences instead of a generic failure. */
const MANAGER_ERRORS = {
  4118: 'admin.provider.errors.managerTaken',
  4120: 'admin.provider.errors.managerRequired',
  4500: 'admin.provider.errors.identityUnavailable',
  4501: 'admin.provider.errors.managerNotFound',
  4502: 'admin.provider.errors.managerInvalid',
  4503: 'admin.provider.errors.managerCenterMismatch'
} as const

type Fallback = 'admin.provider.saveError' | 'admin.provider.actionError'

export function centerErrorKey(error: unknown, fallback: Fallback) {
  const code = apiErrorCode(error)
  return code !== undefined && code in MANAGER_ERRORS ? MANAGER_ERRORS[code as keyof typeof MANAGER_ERRORS] : fallback
}
