import { useQuery } from '@tanstack/react-query'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { fetchCaregiverCatalog, providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'

/** A center's bookable caregivers; the backend caps a catalog page at 100. */
const CAREGIVER_PAGE_SIZE = 100
/** `/caregivers/search` caps a page at 50 (larger sizes answer 400) and ranks at most 500 candidates. */
const SEARCH_PAGE_SIZE = 50
const SEARCH_MAX_PAGES = 10

async function searchAllCaregivers(centerId: string, careServiceIds: string[]) {
  const first = await searchCaregiversByService({ centerId, careServiceIds, page: 0, size: SEARCH_PAGE_SIZE })
  const items = [...first.items]
  const pages = Math.min(first.totalPages, SEARCH_MAX_PAGES)
  for (let page = 1; page < pages; page++) {
    items.push(...(await searchCaregiversByService({ centerId, careServiceIds, page, size: SEARCH_PAGE_SIZE })).items)
  }
  return items
}

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
        ? await searchAllCaregivers(centerId, serviceIds)
        : (await fetchCaregiverCatalog({ centerId, page: 0, size: CAREGIVER_PAGE_SIZE })).items,
    enabled: Boolean(centerId),
    retry: false
  })
  return { centers, caregivers }
}
