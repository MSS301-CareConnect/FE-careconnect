import { useQuery } from '@tanstack/react-query'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { fetchCaregiverByUser } from '~/entities/provider/provider-api'
import { Avatar } from '~/shared/ui/avatar'

/**
 * The caregiver profile behind a CAREGIVER account. Identity has no photo field (D-07), so only caregivers, whose
 * photo lives in ProviderService, show a picture; every other account keeps its initials.
 */
export function useAccountCaregiver(userId: string | undefined, roles: readonly string[] | undefined) {
  return useQuery({
    queryKey: ['provider', 'caregiver-by-user', userId],
    queryFn: () => fetchCaregiverByUser(userId ?? ''),
    enabled: Boolean(userId) && (roles ?? []).includes('CAREGIVER'),
    retry: false,
    staleTime: 60_000
  })
}

export function AccountAvatar({
  userId,
  roles,
  name,
  className
}: {
  userId: string | undefined
  roles: readonly string[] | undefined
  name: string | undefined
  className: string
}) {
  const caregiver = useAccountCaregiver(userId, roles)
  return caregiver.data ? (
    <CaregiverAvatar caregiverId={caregiver.data.id} className={className} name={name ?? ''} />
  ) : (
    <Avatar className={className} decorative name={name ?? ''} />
  )
}
