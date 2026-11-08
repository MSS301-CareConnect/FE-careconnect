import type { QueryClient } from '@tanstack/react-query'

import { providerKeys, type ProviderMediaOwner } from './provider-api'

/**
 * Every cached query that can show an image of this owner, refreshed after an upload or removal (U-11): profile
 * pages, manager and admin lists, customer cards and search results, the center list and public center cards.
 */
export async function invalidateOwnerMedia(
  queryClient: QueryClient,
  ownerType: ProviderMediaOwner,
  ownerId: string,
  options: { centerId?: string } = {}
) {
  const keys: (readonly unknown[])[] = [providerKeys.media(ownerType, ownerId)]
  if (ownerType === 'CAREGIVER_PROFILE') {
    keys.push(
      providerKeys.caregiver(ownerId),
      providerKeys.myProfile,
      providerKeys.publicCaregiver(ownerId),
      providerKeys.catalog,
      ['provider', 'service-caregivers'],
      ['provider', 'pending-caregivers'],
      options.centerId ? providerKeys.caregivers(options.centerId) : ['provider', 'caregivers']
    )
  }
  if (ownerType === 'CARE_CENTER') {
    keys.push(
      providerKeys.center(ownerId),
      providerKeys.centers,
      providerKeys.publicCenters,
      providerKeys.publicCenter(ownerId)
    )
  }
  await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}
