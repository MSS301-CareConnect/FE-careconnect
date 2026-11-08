import { useQuery } from '@tanstack/react-query'

import { fetchCenterSchedules, fetchCenterTimeOffs, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'

/**
 * Today at a glance for the caregiver list: who has an approved shift today and who is on leave right now (one read
 * of each for the whole center, not one per row).
 */
export function useCaregiverToday(centerId: string, today: string, now: number) {
  const scheduleRequest = { fromDate: today, toDate: today, status: 'SCHEDULED' as const, size: 100 }
  const schedules = useQuery({
    queryKey: [...providerKeys.centerSchedules(centerId), scheduleRequest],
    queryFn: () => fetchCenterSchedules(centerId, scheduleRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const leaveRequest = { from: new Date(now).toISOString(), to: new Date(now + 60_000).toISOString(), size: 100 }
  const leaves = useQuery({
    queryKey: [...providerKeys.centerTimeOffs(centerId), 'now', leaveRequest],
    queryFn: () => fetchCenterTimeOffs(centerId, leaveRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const shiftsOf = new Map<string, ProviderScheduleRecord[]>()
  for (const item of schedules.data?.items ?? []) {
    shiftsOf.set(item.caregiverId, [...(shiftsOf.get(item.caregiverId) ?? []), item])
  }
  const onLeave = new Set((leaves.data?.items ?? []).map((item) => item.caregiverId))
  return {
    ready: schedules.isSuccess && leaves.isSuccess,
    failed: schedules.isError || leaves.isError,
    shiftsOf: (caregiverId: string) =>
      (shiftsOf.get(caregiverId) ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    isOnLeave: (caregiverId: string) => onLeave.has(caregiverId),
    workingCount: shiftsOf.size,
    onLeaveCount: onLeave.size
  }
}
