import { changeMyPassword } from '~/shared/api/generated/api/account/account'
import { logoutAllWebSessions } from '~/shared/api/generated/api/authentication/authentication'
import type { ChangePasswordRequest } from '~/shared/api/generated/contracts'
import { csrfHeaders } from './session-api'

export async function changePassword(request: ChangePasswordRequest) {
  const response = await changeMyPassword(request, { credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
}

export async function signOutEverywhere() {
  const response = await logoutAllWebSessions({ credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200) throw new Error(`IdentityService returned code ${response.data.code}`)
}
