import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'

const CATALOG_PAGE_SIZE = 100
const MAX_CATALOG_PAGES = 5

export interface BookingCenter {
  id: string
  name: string
  caregivers: ProviderCaregiverRecord[]
}

/** Every bookable caregiver from the customer catalog, up to five pages of 100. */
async function fetchBookableCaregivers() {
  const caregivers: ProviderCaregiverRecord[] = []
  for (let page = 0; page < MAX_CATALOG_PAGES; page += 1) {
    const result = await fetchCaregiverCatalog({ page, size: CATALOG_PAGE_SIZE })
    caregivers.push(...result.items)
    if (page + 1 >= result.totalPages) break
  }
  return caregivers
}

/**
 * Customers cannot list ProviderService centers, so the booking form groups the caregiver catalog by
 * center. A center without an active caregiver therefore does not appear.
 */
export function useBookingProviders() {
  const catalog = useQuery({
    queryKey: [...providerKeys.catalog, 'booking'],
    queryFn: fetchBookableCaregivers,
    retry: false
  })
  const centers = useMemo(() => {
    const byId = new Map<string, BookingCenter>()
    for (const caregiver of catalog.data ?? []) {
      if (!caregiver.centerId) continue
      const center = byId.get(caregiver.centerId) ?? {
        id: caregiver.centerId,
        name: caregiver.centerName ?? caregiver.centerId,
        caregivers: []
      }
      center.caregivers.push(caregiver)
      byId.set(center.id, center)
    }
    return [...byId.values()].sort((first, second) => first.name.localeCompare(second.name))
  }, [catalog.data])
  return { catalog, centers }
}
