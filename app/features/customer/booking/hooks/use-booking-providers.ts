import { useQuery } from '@tanstack/react-query'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'

/** A center's bookable caregivers; the backend caps a catalog page at 100. */
const CAREGIVER_PAGE_SIZE = 100

/**
 * Centers come from ProviderService's customer center list, and only the chosen center's caregivers
 * are read from the caregiver catalog.
 */
export function useBookingProviders(centerId: string) {
  const centers = useServiceCenters()
  const caregivers = useQuery({
    queryKey: [...providerKeys.catalog, 'booking', centerId],
    queryFn: async () => (await fetchCaregiverCatalog({ centerId, page: 0, size: CAREGIVER_PAGE_SIZE })).items,
    enabled: Boolean(centerId),
    retry: false
  })
  return { centers, caregivers }
}
