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
 * its error so the user can repeat it with the new session. An unauthorized refresh ends the session and returns to sign-in.
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
    } catch (error) {
      // A temporary IdentityService or network failure does not revoke the session.
      if (errorStatus(error) === 401) onSessionExpired()
    }
  }

  // Queries fetched again right after a successful refresh. When such a query still returns 401 the token is not the
  // problem (e.g. a service rejecting a valid session), so the error is shown instead of refreshing and refetching in
  // an endless loop. Cleared on the next success or on that second 401, so a later manual retry may refresh once more.
  const retriedAfterRefresh = new Set<string>()

  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onSuccess: (_data, query) => {
        retriedAfterRefresh.delete(query.queryHash)
      },
      onError: (error, query: Query<unknown, unknown, unknown, readonly unknown[]>) => {
        if (errorStatus(error) !== 401 || query.queryKey[0] === SESSION_QUERY_PREFIX || !hasActiveSession()) return
        if (retriedAfterRefresh.delete(query.queryHash)) return
        void recover(() => {
          retriedAfterRefresh.add(query.queryHash)
          void client.refetchQueries({ queryKey: query.queryKey, exact: true })
        })
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
