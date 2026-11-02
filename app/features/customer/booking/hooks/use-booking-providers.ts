import { useQuery } from '@tanstack/react-query'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { fetchCaregiverCatalog, providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'

/** A center's bookable caregivers; the backend caps a catalog page at 100. */
const CAREGIVER_PAGE_SIZE = 100

/**
 * Centers come from ProviderService's customer center list. The chosen center's caregivers are read from the caregiver
 * catalog, or — once services are chosen — only those who provide every chosen service (Q10).
 */
export function useBookingProviders(centerId: string, careServiceIds: readonly string[] = []) {
  const centers = useServiceCenters()
  const serviceIds = [...careServiceIds].sort()
  const caregivers = useQuery({
    queryKey: [...providerKeys.catalog, 'booking', centerId, serviceIds],
    queryFn: async () =>
      serviceIds.length > 0
        ? (
            await searchCaregiversByService({
              centerId,
              careServiceIds: serviceIds,
              page: 0,
              size: CAREGIVER_PAGE_SIZE
            })
          ).items
        : (await fetchCaregiverCatalog({ centerId, page: 0, size: CAREGIVER_PAGE_SIZE })).items,
    enabled: Boolean(centerId),
    retry: false
  })
  return { centers, caregivers }
}
