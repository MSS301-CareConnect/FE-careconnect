import { useQuery } from '@tanstack/react-query'

import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'

/** ProviderService caps a page at 100; five pages cover every center the picker can show. */
const PAGE_SIZE = 100
const MAX_PAGES = 5

/** Every non-archived center, PENDING included: a new center needs its manager before it can be approved. */
async function fetchCenterOptions(): Promise<ProviderCenterRecord[]> {
  const centers: ProviderCenterRecord[] = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchCenters({ page, size: PAGE_SIZE })
    centers.push(...result.items.filter((center) => center.centerStatus !== 'ARCHIVED'))
    if (page + 1 >= result.totalPages) break
  }
  return centers.sort((a, b) => a.centerName.localeCompare(b.centerName, 'vi'))
}

export function useCenterOptions(enabled: boolean) {
  return useQuery({
    queryKey: [...providerKeys.centers, 'account-options'],
    queryFn: fetchCenterOptions,
    enabled,
    retry: false
  })
}
