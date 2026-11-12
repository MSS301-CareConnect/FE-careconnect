import { provisionUser } from '~/shared/api/generated/api/account/account'
import { writeOptions } from '~/shared/api/request'

export async function provisionCaregiverAccount(email: string, fullName: string, phoneNumber?: string) {
  const response = await provisionUser({ email, fullName, phoneNumber, roleCode: 'CAREGIVER' }, await writeOptions())
  if (response.data.code !== 200 || !response.data.result?.id) {
    throw new Error('IdentityService did not return a caregiver account ID')
  }
  return response.data.result.id
}
