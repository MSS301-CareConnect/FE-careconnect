import { useQuery } from '@tanstack/react-query'

import { fetchPublicCenter, fetchPublicCenters, providerKeys } from '~/entities/provider/provider-api'
import type { PublicCenterRecord } from '~/shared/api/generated/contracts'

/** The customer list collects pages of up to 100 so the picker can search every active center locally. */
const PUBLIC_PAGE_SIZE = 100
const MAX_PUBLIC_PAGES = 5

/** The chosen center as the customer pages use it and as it is remembered in the browser. */
export type ServiceCenter = { id: string; name: string }

/** A selectable center with the customer-facing details the picker shows to compare centers. */
export type ServiceCenterOption = ServiceCenter & {
  address?: string
  operatingHours?: string
  phoneNumber?: string
  minPrice?: number
  serviceCount?: number
}

function toOption(center: PublicCenterRecord): ServiceCenterOption {
  return {
    id: center.centerId,
    name: center.centerName,
    address: center.address || undefined,
    operatingHours: center.operatingHours || undefined,
    phoneNumber: center.phoneNumber || undefined,
    minPrice: center.minPrice ?? undefined,
    serviceCount: center.serviceCount ?? undefined
  }
}

/** Every ACTIVE center from ProviderService's customer endpoint, sorted by name. */
export async function fetchServiceCenters(): Promise<ServiceCenterOption[]> {
  const centers: ServiceCenterOption[] = []
  for (let page = 0; page < MAX_PUBLIC_PAGES; page += 1) {
    const result = await fetchPublicCenters({ page, size: PUBLIC_PAGE_SIZE })
    centers.push(...result.items.map(toOption))
    if (page + 1 >= result.totalPages) break
  }
  return centers.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export function useServiceCenters({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: providerKeys.publicCenters,
    queryFn: fetchServiceCenters,
    retry: false,
    staleTime: 5 * 60_000,
    enabled
  })
}

/** The current customer-facing details of one center; a 404 means it no longer takes bookings. */
export function useServiceCenter(id: string | undefined) {
  return useQuery({
    queryKey: providerKeys.publicCenter(id ?? ''),
    queryFn: async () => toOption(await fetchPublicCenter(id ?? '')),
    enabled: Boolean(id),
    retry: false,
    staleTime: 5 * 60_000
  })
}
