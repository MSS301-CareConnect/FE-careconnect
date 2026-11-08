import { useQuery } from '@tanstack/react-query'

import { Avatar } from '~/shared/ui/avatar'

import { fetchProviderMedia, providerKeys } from './provider-api'
import { pickAvatar } from './provider-avatar'

export interface CaregiverAvatarProps {
  caregiverId: string
  name: string
  /** An avatar URL the list response already carries (public cards); skips the media request. */
  src?: string
  className?: string
  enabled?: boolean
}

/**
 * A caregiver's profile photo in any list or header. It reads the same media cache the profile page writes, so an
 * upload elsewhere shows here as soon as `invalidateOwnerMedia` runs.
 */
export function CaregiverAvatar({ caregiverId, name, src, className, enabled = true }: CaregiverAvatarProps) {
  const media = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', caregiverId),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', caregiverId),
    enabled: enabled && !src && Boolean(caregiverId),
    retry: false,
    staleTime: 30_000
  })
  return (
    <Avatar
      className={className}
      name={name}
      onExpired={() => void media.refetch()}
      src={src ?? pickAvatar(media.data)?.downloadUrl}
    />
  )
}
