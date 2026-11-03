import { useQuery } from '@tanstack/react-query'

import { fetchMySchedules, fetchTimeOffs, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'

import { VISIT_PAGE_SIZE, useVisitPage } from '../../data/caregiver-queries'

const SCHEDULE_PAGE_SIZE = 100
const MAX_SCHEDULE_PAGES = 5

/** Every availability slot of the caregiver; ProviderService has no date filter, so pages are collected. */
async function fetchAllMySchedules() {
  const items: ProviderScheduleRecord[] = []
  for (let page = 0; page < MAX_SCHEDULE_PAGES; page += 1) {
    const result = await fetchMySchedules({ page, size: SCHEDULE_PAGE_SIZE })
    items.push(...result.items)
    if (page + 1 >= result.totalPages) break
  }
  return items
}

export function useMySchedules() {
  return useQuery({ queryKey: [...providerKeys.mySchedules, 'all'], queryFn: fetchAllMySchedules, retry: false })
}

/** Availability, visits and time off for the days shown by the calendar. */
export function useCalendarData(profileId: string | undefined, from: string, to: string) {
  const schedules = useMySchedules()
  const visits = useVisitPage({ from, to, page: 0, size: VISIT_PAGE_SIZE })
  const timeOffs = useQuery({
    queryKey: [...providerKeys.timeOffs(profileId ?? ''), 'range', from, to],
    queryFn: () =>
      fetchTimeOffs(profileId ?? '', {
        from: new Date(`${from}T00:00:00+07:00`).toISOString(),
        to: new Date(`${to}T23:59:59+07:00`).toISOString()
      }),
    enabled: Boolean(profileId),
    retry: false
  })
  return { schedules, visits, timeOffs }
}
