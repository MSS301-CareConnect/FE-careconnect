import { MutationCache, QueryCache, QueryClient, type Query } from '@tanstack/react-query'

import { errorStatus, refreshSession } from './session-refresh'

const SESSION_QUERY_PREFIX = 'auth'
const CURRENT_USER_QUERY_KEY = ['auth', 'current-user'] as const

/** Sends the browser to sign in again and back to the current page afterwards (`/login?next=`). */
export function redirectToLogin() {
  const next = `${window.location.pathname}${window.location.search}`
  if (window.location.pathname === '/login') return
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

export interface QueryClientOptions {
  onSessionExpired?: () => void
}

/**
 * H-07: an access token expiring mid-session no longer surfaces as a generic error. A 401 from any query or mutation
 * refreshes the session once (shared across concurrent failures); queries are then fetched again, a mutation keeps
 * its error so the user can repeat it with the new session. A failed refresh ends the session and returns to sign-in.
 * The session query itself already refreshes in `loadSession`, so it is left out.
 */
export function createQueryClient({ onSessionExpired = redirectToLogin }: QueryClientOptions = {}) {
  // Public browse pages also use this client. A 401 there does not mean a guest's session expired.
  function hasActiveSession() {
    return Boolean(client.getQueryData(CURRENT_USER_QUERY_KEY))
  }

  async function recover(retry?: () => void) {
    try {
      await refreshSession()
      retry?.()
    } catch {
      onSessionExpired()
    }
  }
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query: Query<unknown, unknown, unknown, readonly unknown[]>) => {
        if (errorStatus(error) !== 401 || query.queryKey[0] === SESSION_QUERY_PREFIX || !hasActiveSession()) return
        void recover(() => void client.refetchQueries({ queryKey: query.queryKey, exact: true }))
      }
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (errorStatus(error) === 401 && hasActiveSession()) void recover()
      }
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // A 401 is handled by the cache above; retrying it with the expired token would only fail again.
        retry: (failureCount, error) => errorStatus(error) !== 401 && failureCount < 1,
        staleTime: 30_000
      },
      mutations: {
        retry: 0
      }
    }
  })
  return client
}
