import { apiErrorCode, apiErrorStatus, apiRequestErrorKey, type ApiRequestErrorKey } from './error-details'

/**
 * Three tiers of a failed write, decided once for every form:
 * - `field`: the backend code names one input — the message goes under that input.
 * - `business`: a rule of the domain refused the action (conflict, state, permission) — shown at the end of the form.
 * - `system`: the service, network or an unknown failure — shown at the end of the form with a retry.
 *
 * BookingService, ProviderService… return only the FIRST validation code, so forms still validate every field on
 * the client before sending; the field map here is the safety net for what the client could not know.
 */
export type ApiFailure<F extends string, K extends string, B extends string = never> =
  | { kind: 'field'; field: F; key: K }
  | { kind: 'business'; key: B | ApiRequestErrorKey }
  | { kind: 'system'; key: ApiRequestErrorKey }

/**
 * `K` is the form's own field-error key (translated by the form); `B` is a full translation key of a business
 * sentence, so a form-level failure is always rendered with `t(failure.key)`.
 */
export interface ApiErrorMap<F extends string, K extends string, B extends string = never> {
  /** Backend codes that belong to one input. */
  fields?: Partial<Record<number, { field: F; key: K }>>
  /** Backend codes with a dedicated business sentence. */
  business?: Partial<Record<number, B>>
}

const SYSTEM_KEYS: ReadonlySet<ApiRequestErrorKey> = new Set([
  'errors.request.unavailable',
  'errors.request.server',
  'errors.request.network'
])

export function classifyApiError<F extends string, K extends string, B extends string = never>(
  error: unknown,
  map: ApiErrorMap<F, K, B> = {}
): ApiFailure<F, K, B> {
  const code = apiErrorCode(error)
  if (code !== undefined) {
    const field = map.fields?.[code]
    if (field) return { kind: 'field', field: field.field, key: field.key }
    const business = map.business?.[code]
    if (business) return { kind: 'business', key: business }
  }
  const key = apiRequestErrorKey(error, 'errors.request.server')
  if (SYSTEM_KEYS.has(key) || apiErrorStatus(error) === undefined) {
    return { kind: 'system', key: key === 'errors.request.invalid' ? 'errors.request.server' : key }
  }
  return { kind: 'business', key }
}
