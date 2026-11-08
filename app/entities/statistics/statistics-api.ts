import { getCenterStatistics, getSystemStatistics } from '~/shared/api/generated/api/statistics/statistics'
import { getProviderStatistics } from '~/shared/api/generated/api/provider-center/provider-center'

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`Statistics API returned code ${response.data.code}`)
  return response.data.result
}

const readOptions = { credentials: 'include' as const }

export const statisticsKeys = {
  center: ['statistics', 'center'] as const,
  centerById: (centerId: string) => ['statistics', 'center', centerId] as const,
  system: ['statistics', 'system'] as const,
  providers: ['statistics', 'providers'] as const
}

/** A manager reads their own center; an ADMIN passes the center to read (BookingService scopes by role). */
export async function fetchCenterStatistics(centerId?: string) {
  return result(await getCenterStatistics(centerId ? { centerId } : undefined, readOptions))
}

export async function fetchSystemStatistics() {
  return result(await getSystemStatistics(undefined, readOptions))
}

export async function fetchProviderStatistics() {
  return result(await getProviderStatistics(readOptions))
}
