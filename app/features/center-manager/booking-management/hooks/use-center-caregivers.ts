import { useQuery } from '@tanstack/react-query'

import { fetchCaregivers, providerKeys } from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ListCenterCaregiversParams } from '~/shared/api/generated/contracts'

const request: ListCenterCaregiversParams = { status: 'ACTIVE', verification: 'VERIFIED', page: 0, size: 100 }

/** Caregivers of the manager's center who can be assigned (active and verified), with an ID → name lookup. */
export function useCenterCaregivers() {
  const centerId = useAuthUser()?.centerId ?? ''
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), request],
    queryFn: () => fetchCaregivers(centerId, request),
    enabled: Boolean(centerId),
    retry: false
  })
  const options = (caregivers.data?.items ?? []).map((caregiver) => ({
    // BookingService stores the ProviderService caregiver ID.
    id: caregiver.caregiverId ?? caregiver.id,
    name: caregiver.fullName
  }))
  const names = new Map(options.map((option) => [option.id, option.name]))
  return { caregivers, options, nameOf: (id: string) => names.get(id) }
}
