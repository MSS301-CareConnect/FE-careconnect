import { requestPasswordReset, resetPassword } from '~/shared/api/generated/api/account/account'
import type { PasswordResetEmailRequest, ResetPasswordRequest } from '~/shared/api/generated/contracts'

import { serviceResponse, writeOptions } from '~/shared/api/request'

const { success } = serviceResponse('IdentityService')

export async function sendPasswordResetCode(request: PasswordResetEmailRequest): Promise<void> {
  const response = await requestPasswordReset(request, await writeOptions())
  success(response)
}

export async function confirmPasswordReset(request: ResetPasswordRequest): Promise<void> {
  const response = await resetPassword(request, await writeOptions())
  success(response)
}

export function passwordRecoveryErrorKey(error: unknown) {
  if (typeof error === 'object' && error !== null && 'info' in error) {
    const info: unknown = error.info
    if (typeof info === 'object' && info !== null && 'code' in info) {
      const code = info.code
      if ([1059, 1060, 1061, 1062, 1063, 1072].includes(Number(code))) return 'auth.recovery.invalidOtp'
      if (code === 1074) return 'auth.recovery.passwordRules'
    }
  }
  return 'auth.recovery.requestFailed'
}
