import { refreshWebSession } from '~/shared/api/generated/api/authentication/authentication'

import { csrfHeaders } from './csrf'

let refreshPromise: Promise<void> | null = null

/**
 * Rotates the web session once for every caller that hits a 401 at the same time (one refresh request, shared
 * promise). Throws when IdentityService no longer accepts the refresh cookie.
 */
export async function refreshSession(): Promise<void> {
  refreshPromise ??= (async () => {
    const response = await refreshWebSession({ credentials: 'include', headers: await csrfHeaders() })
    if (response.data.code !== 200 || !response.data.result.authenticated) throw new Error('Session refresh failed')
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

export function errorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}
