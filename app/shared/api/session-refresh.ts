import { refreshWebSession } from '~/shared/api/generated/api/authentication/authentication'

import { csrfHeaders } from './csrf'

let refreshPromise: Promise<void> | null = null
const REFRESH_LOCK = 'careconnect-web-session-refresh'
const LAST_REFRESH_KEY = 'careconnect-web-last-refresh'
const RECENT_REFRESH_MS = 5_000

async function rotateSession() {
  const response = await refreshWebSession({ credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200 || !response.data.result.authenticated) throw new Error('Session refresh failed')
}

/**
 * Rotates the web session once for every caller that hits a 401 at the same time (one refresh request, shared
 * promise). Throws when IdentityService no longer accepts the refresh cookie.
 */
export async function refreshSession(): Promise<void> {
  refreshPromise ??= (async () => {
    // A refresh token is single use. Coordinate tabs so a second tab does not submit
    // the cookie it read while the first tab was rotating it.
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      const startedAt = Date.now()
      await navigator.locks.request(REFRESH_LOCK, async () => {
        const lastRefresh = Number(window.localStorage.getItem(LAST_REFRESH_KEY))
        if (lastRefresh >= startedAt - RECENT_REFRESH_MS && lastRefresh <= Date.now()) return
        await rotateSession()
        window.localStorage.setItem(LAST_REFRESH_KEY, String(Date.now()))
      })
    } else {
      await rotateSession()
    }
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

export function errorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}
