import { getCurrentUser } from '~/shared/api/generated/api/account/account'
import { loginWeb, logoutWebSession, refreshWebSession } from '~/shared/api/generated/api/authentication/authentication'
import type { LoginRequest, UserResponse } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/shared/api/csrf'

export { csrfHeaders } from '~/shared/api/csrf'

export const sessionQueryKey = ['auth', 'current-user'] as const

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

function requireSuccess(code: number) {
  if (code !== 200) throw new Error(`IdentityService returned code ${code}`)
}

async function currentUser(): Promise<UserResponse> {
  const response = await getCurrentUser({ credentials: 'include' })
  requireSuccess(response.data.code)
  if (!response.data.result.id || !response.data.result.roles) throw new Error('Incomplete user session')
  return response.data.result
}

let refreshPromise: Promise<void> | null = null

async function refreshSession() {
  refreshPromise ??= (async () => {
    const response = await refreshWebSession({ credentials: 'include', headers: await csrfHeaders() })
    requireSuccess(response.data.code)
    if (!response.data.result.authenticated) throw new Error('Session refresh failed')
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

export async function loadSession(): Promise<UserResponse | null> {
  try {
    return await currentUser()
  } catch (error) {
    if (statusOf(error) !== 401) throw error
  }

  try {
    await refreshSession()
    return await currentUser()
  } catch (error) {
    if (statusOf(error) === 401) return null
    throw error
  }
}

export async function signIn(credentials: LoginRequest): Promise<UserResponse> {
  const response = await loginWeb(credentials, { credentials: 'include', headers: await csrfHeaders() })
  requireSuccess(response.data.code)
  if (!response.data.result.authenticated) throw new Error('Login failed')
  return currentUser()
}

export async function signOut(): Promise<void> {
  const response = await logoutWebSession({ credentials: 'include', headers: await csrfHeaders() })
  requireSuccess(response.data.code)
}

export function isCredentialError(error: unknown) {
  return statusOf(error) === 400 || statusOf(error) === 401
}

export function isForbiddenError(error: unknown) {
  return statusOf(error) === 403
}
