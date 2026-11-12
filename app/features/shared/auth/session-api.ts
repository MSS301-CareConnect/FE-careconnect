import { getCurrentUser } from '~/shared/api/generated/api/account/account'
import { loginWeb, logoutWebSession } from '~/shared/api/generated/api/authentication/authentication'
import type { LoginRequest, UserResponse } from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'
import { refreshSession } from '~/shared/api/session-refresh'

export { csrfHeaders } from '~/shared/api/csrf'

export const sessionQueryKey = ['auth', 'current-user'] as const

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

const { success } = serviceResponse('IdentityService')

async function currentUser(): Promise<UserResponse> {
  const response = await getCurrentUser(readOptions)
  success(response)
  if (!response.data.result.id || !response.data.result.roles) throw new Error('Incomplete user session')
  return response.data.result
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
  const response = await loginWeb(credentials, await writeOptions())
  success(response)
  if (!response.data.result.authenticated) throw new Error('Login failed')
  return currentUser()
}

export async function signOut(): Promise<void> {
  const response = await logoutWebSession(await writeOptions())
  success(response)
}

export function isCredentialError(error: unknown) {
  return statusOf(error) === 400 || statusOf(error) === 401
}

export function isForbiddenError(error: unknown) {
  return statusOf(error) === 403
}
