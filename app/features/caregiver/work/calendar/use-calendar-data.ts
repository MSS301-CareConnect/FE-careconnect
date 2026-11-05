import { useQuery } from '@tanstack/react-query'

import { fetchTimeOffs, providerKeys } from '~/entities/provider/provider-api'

import { VISIT_PAGE_SIZE, useMySchedules, useVisitPage } from '../../data/caregiver-queries'

export { useMySchedules }

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
