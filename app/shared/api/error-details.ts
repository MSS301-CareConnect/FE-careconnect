export function apiErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

export function apiErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  if (typeof info !== 'object' || info === null || !('code' in info)) return undefined
  return typeof info.code === 'number' ? info.code : undefined
}

export type ApiRequestErrorKey =
  | 'errors.request.invalid'
  | 'errors.request.unauthorized'
  | 'errors.request.forbidden'
  | 'errors.request.notFound'
  | 'errors.request.conflict'
  | 'errors.request.rateLimited'
  | 'errors.request.unavailable'
  | 'errors.request.server'
  | 'errors.request.network'

/** Select safe, translated feedback from HTTP metadata. Never render backend text or numeric codes. */
export function apiRequestErrorKey<F extends string>(error: unknown, fallback: F): ApiRequestErrorKey | F {
  const status = apiErrorStatus(error)
  if (status === 400 || status === 422) return 'errors.request.invalid'
  if (status === 401) return 'errors.request.unauthorized'
  if (status === 403) return 'errors.request.forbidden'
  if (status === 404) return 'errors.request.notFound'
  if (status === 409 || status === 412) return 'errors.request.conflict'
  if (status === 429) return 'errors.request.rateLimited'
  if (status === 502 || status === 503 || status === 504) return 'errors.request.unavailable'
  if (status !== undefined && status >= 500) return 'errors.request.server'
  if (error instanceof TypeError || (error instanceof Error && /network|failed to fetch/i.test(error.message))) {
    return 'errors.request.network'
  }
  return fallback
}
