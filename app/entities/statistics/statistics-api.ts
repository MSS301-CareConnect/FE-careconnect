import { getCenterStatistics, getSystemStatistics } from '~/shared/api/generated/api/statistics/statistics'
import { getProviderStatistics } from '~/shared/api/generated/api/provider-center/provider-center'
import { readOptions, serviceResponse } from '~/shared/api/request'

const { result } = serviceResponse('Statistics API')

// Admin dashboard ranks centers from one page of the per-center breakdown.
const TOP_CENTER_PAGE_SIZE = 100

export const statisticsKeys = {
  center: ['statistics', 'center'] as const,
  centerById: (centerId: string) => ['statistics', 'center', centerId] as const,
  centerRange: (fromDate: string, toDate: string) => ['statistics', 'center', 'range', fromDate, toDate] as const,
  system: ['statistics', 'system'] as const,
  systemRange: (fromDate: string, toDate: string) => ['statistics', 'system', 'range', fromDate, toDate] as const,
  providers: ['statistics', 'providers'] as const
}

/** A manager reads their own center; an ADMIN passes the center to read (BookingService scopes by role). */
export async function fetchCenterStatistics(centerId?: string) {
  return result(await getCenterStatistics(centerId ? { centerId } : undefined, readOptions))
}

/** The manager's own center for one dashboard period (Vietnam calendar days, inclusive). */
export async function fetchCenterStatisticsBetween(fromDate: string, toDate: string) {
  return result(await getCenterStatistics({ from: fromDate, to: toDate }, readOptions))
}

export async function fetchSystemStatistics() {
  return result(await getSystemStatistics(undefined, readOptions))
}

/** Platform totals for one period plus the per-center breakdown used to rank the busiest centers. */
export async function fetchSystemStatisticsBetween(fromDate: string, toDate: string) {
  return result(await getSystemStatistics({ from: fromDate, to: toDate, size: TOP_CENTER_PAGE_SIZE }, readOptions))
}

export async function fetchProviderStatistics() {
  return result(await getProviderStatistics(readOptions))
}
