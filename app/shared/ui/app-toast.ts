import { toast } from 'sonner'

import { classifyApiError } from '../api/api-error'

const SUCCESS_MS = 4_000
const ERROR_MS = 8_000

/** A finished write, named after its nav item and action (`admin.toast.<item>.<action>`). */
export function toastSuccess(message: string) {
  toast.success(message, { duration: SUCCESS_MS })
}

/**
 * A system failure (5xx, unavailable service, lost connection) as a toast with an optional retry. Validation and
 * business failures stay in their form (U-10), so this returns false for them and shows nothing.
 */
export function toastSystemError(
  error: unknown,
  { message, retryLabel, retry }: { message: string; retryLabel?: string; retry?: () => void }
) {
  if (classifyApiError(error).kind !== 'system') return false
  toast.error(message, {
    duration: ERROR_MS,
    action: retry && retryLabel ? { label: retryLabel, onClick: retry } : undefined
  })
  return true
}
