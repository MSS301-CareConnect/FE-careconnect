import {
  registerCustomer,
  resendRegistrationOtp,
  verifyCustomerRegistration
} from '~/shared/api/generated/api/account/account'
import type {
  RegisterRequest,
  RegistrationEmailRequest,
  RegistrationOtp,
  VerifyRegistrationRequest
} from '~/shared/api/generated/contracts'
import { serviceResponse, writeOptions } from '~/shared/api/request'

const { success } = serviceResponse('IdentityService')

export async function beginRegistration(request: RegisterRequest): Promise<RegistrationOtp> {
  const response = await registerCustomer(request, await writeOptions())
  success(response)
  return response.data.result
}

export async function verifyRegistration(request: VerifyRegistrationRequest): Promise<void> {
  const response = await verifyCustomerRegistration(request, await writeOptions())
  success(response)
}

export async function resendOtp(request: RegistrationEmailRequest): Promise<RegistrationOtp> {
  const response = await resendRegistrationOtp(request, await writeOptions())
  success(response)
  return response.data.result
}

function errorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info: unknown = error.info
  if (typeof info !== 'object' || info === null || !('code' in info)) return undefined
  return typeof info.code === 'number' ? info.code : undefined
}

export function registrationErrorKey(error: unknown, action: 'register' | 'verify' | 'resend') {
  switch (errorCode(error)) {
    case 1003:
      return 'auth.registration.emailInUse'
    case 1074:
      return 'auth.registration.passwordRules'
    case 1060:
    case 1061:
    case 1062:
    case 1063:
    case 1072:
      return 'auth.registration.invalidOtp'
    case 1079:
      return 'auth.registration.resendTooSoon'
    case 1080:
      return 'auth.registration.sessionExpired'
    default:
      return action === 'register'
        ? 'auth.registration.registerFailed'
        : action === 'verify'
          ? 'auth.registration.verifyFailed'
          : 'auth.registration.resendFailed'
  }
}
