import { changeMyPassword } from '~/shared/api/generated/api/account/account'
import {
  listWebSessions,
  logoutAllWebSessions,
  revokeWebSession
} from '~/shared/api/generated/api/authentication/authentication'
import type { ChangePasswordRequest, SessionRecord } from '~/shared/api/generated/contracts'
import { csrfHeaders } from './session-api'

export async function changePassword(request: ChangePasswordRequest) {
  const response = await changeMyPassword(request, { credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
}

export async function signOutEverywhere() {
  const response = await logoutAllWebSessions({ credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
}

export async function fetchWebSessions(): Promise<SessionRecord[]> {
  const response = await listWebSessions({ credentials: 'include' })
  if (response.data.code !== 200 || !Array.isArray(response.data.result))
    throw new Error('Invalid IdentityService session list')
  return response.data.result
}

export async function revokeSession(sessionId: string): Promise<void> {
  const response = await revokeWebSession(sessionId, { credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
}
