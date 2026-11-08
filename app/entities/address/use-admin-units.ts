import { useQuery } from '@tanstack/react-query'

import { loadAdminUnits } from './admin-units'

export const adminUnitKeys = { all: ['admin-units', 'vn-2025'] as const }

/** Provinces with their wards, loaded once per visit and kept for the rest of it (the list is static). */
export function useAdminUnits() {
  return useQuery({
    queryKey: adminUnitKeys.all,
    queryFn: loadAdminUnits,
    staleTime: Infinity,
    gcTime: Infinity
  })
}
