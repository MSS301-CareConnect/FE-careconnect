import { changeMyPassword } from '~/shared/api/generated/api/account/account'
import {
  listWebSessions,
  logoutWebSession,
  revokeWebSession
} from '~/shared/api/generated/api/authentication/authentication'
import type { ChangePasswordRequest, SessionRecord } from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'

const { success } = serviceResponse('IdentityService')

export async function changePassword(request: ChangePasswordRequest) {
  const response = await changeMyPassword(request, await writeOptions())
  success(response)
}

export async function signOutEverywhere() {
  const sessions = await fetchWebSessions()
  for (const session of sessions.filter((item) => !item.isCurrent)) {
    await revokeSession(session.sessionId)
  }
  const current = sessions.find((item) => item.isCurrent)
  if (current) {
    await revokeSession(current.sessionId)
  } else {
    const response = await logoutWebSession(await writeOptions())
    success(response)
  }
}

export async function fetchWebSessions(): Promise<SessionRecord[]> {
  const response = await listWebSessions(readOptions)
  if (response.data.code !== 200 || !Array.isArray(response.data.result))
    throw new Error('Invalid IdentityService session list')
  return response.data.result
}

export async function revokeSession(sessionId: string): Promise<void> {
  const response = await revokeWebSession(sessionId, await writeOptions())
  success(response)
}
