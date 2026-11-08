import { updateMyProfile } from '~/shared/api/generated/api/account/account'
import type { UpdateProfileRequest, UserResponse } from '~/shared/api/generated/contracts'
import { csrfHeaders } from '~/features/shared/auth/session-api'

export async function saveMyProfile(request: UpdateProfileRequest): Promise<UserResponse> {
  const response = await updateMyProfile(request, { credentials: 'include', headers: await csrfHeaders() })
  if (response.data.code !== 200 || !response.data.result.id) throw new Error('Profile update failed')
  return response.data.result
}
