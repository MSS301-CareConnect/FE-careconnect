import { useQueries, useQuery } from '@tanstack/react-query'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { fetchCaregiverCatalog, providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'
import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'

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
 * Centers come from ProviderService's customer center list. Every caregiver of the chosen center stays listed (catalog
 * plus anyone the skill search finds beyond its first page); each chosen service is searched on its own so the form
 * can say which services a caregiver does not provide instead of hiding them (2026-11-05).
 */
export function useBookingProviders(centerId: string, careServiceIds: readonly string[] = []) {
  const centers = useServiceCenters()
  const serviceIds = [...careServiceIds].sort()
  const catalog = useQuery({
    queryKey: [...providerKeys.catalog, 'booking', centerId],
    queryFn: async () => (await fetchCaregiverCatalog({ centerId, page: 0, size: CAREGIVER_PAGE_SIZE })).items,
    enabled: Boolean(centerId),
    retry: false
  })
  const skills = useQueries({
    queries: serviceIds.map((serviceId) => ({
      queryKey: [...providerKeys.catalog, 'booking', centerId, [serviceId]],
      queryFn: () => searchAllCaregivers(centerId, [serviceId]),
      enabled: Boolean(centerId),
      retry: false
    }))
  })
  const skillsPending = skills.some((query) => query.isPending)
  const skillsError = skills.find((query) => query.isError)

  const merged = new Map<string, ProviderCaregiverCardRecord>()
  for (const item of catalog.data ?? []) merged.set(item.caregiverId, item)
  for (const query of skills) for (const item of query.data ?? []) merged.set(item.caregiverId, item)

  const caregivers = {
    data: catalog.data ? [...merged.values()] : undefined,
    isPending: catalog.isPending || skillsPending,
    isError: catalog.isError || Boolean(skillsError),
    isSuccess: catalog.isSuccess && !skillsPending && !skillsError,
    refetch: async () => {
      await Promise.all([catalog.refetch(), ...skills.map((query) => query.refetch())])
    }
  }

  /** The chosen services this caregiver does not provide; empty while the skills are still loading. */
  function missingServiceIds(caregiverId: string) {
    return serviceIds.filter((serviceId, index) => {
      const found = skills[index]?.data
      return found !== undefined && !found.some((item) => item.caregiverId === caregiverId)
    })
  }

  return { centers, caregivers, missingServiceIds }
}
