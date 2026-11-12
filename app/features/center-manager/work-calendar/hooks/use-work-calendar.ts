import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { vnInstant } from '~/entities/provider/caregiver-time-offs'
import {
  fetchCaregivers,
  fetchCenterSchedules,
  fetchCenterTimeOffs,
  providerKeys
} from '~/entities/provider/provider-api'
import type { ListCenterCaregiversParams } from '~/shared/api/generated/contracts'
import { addDays, mondayOf } from '~/shared/lib/format'
import { pageSizeOf } from '~/shared/ui/pagination'

export const CALENDAR_VIEWS = ['team', 'list', 'timeOff'] as const
export type CalendarView = (typeof CALENDAR_VIEWS)[number]
export const TIME_OFF_SCOPES = ['current', 'week', 'past'] as const
export type TimeOffScope = (typeof TIME_OFF_SCOPES)[number]

const DATE = /^\d{4}-\d{2}-\d{2}$/
// ProviderService pages hold at most 100 rows; a center rarely has more shifts in one week.
const WEEK_LIMIT = 100
const caregiverRequest: ListCenterCaregiversParams = { page: 0, size: 100 }
export const CALENDAR_PAGE_SIZES = [10, 20, 50] as const

/**
 * Center work calendar state in the URL (`view`, `week` = its Monday, `caregiver`, `scope` of the time-off tab) and the
 * three reads behind it: the center's caregivers, the week's work schedules and the week's time off. ProviderService
 * scopes every read to the manager's own center.
 */
export function useWorkCalendar(centerId: string, today: string, now: number) {
  const [params, setParams] = useSearchParams()
  const view = CALENDAR_VIEWS.find((item) => item === params.get('view')) ?? 'team'
  const rawWeek = params.get('week') ?? ''
  const monday = DATE.test(rawWeek) ? mondayOf(rawWeek) : mondayOf(today)
  const sunday = addDays(monday, 6)
  const caregiverId = params.get('caregiver') ?? ''
  const scope = TIME_OFF_SCOPES.find((item) => item === params.get('scope')) ?? 'current'
  // The list and the time-off tab are paged by ProviderService (`?page=`, `?size=`); the team grid needs the whole week.
  const page = Math.max(0, Number(params.get('page')) || 0)
  const size = pageSizeOf(params.get('size'), 10, CALENDAR_PAGE_SIZES)
  const weekFrom = vnInstant(monday, '00:00')
  const weekTo = vnInstant(addDays(monday, 7), '00:00')

  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), caregiverRequest],
    queryFn: () => fetchCaregivers(centerId, caregiverRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const scheduleRequest = {
    fromDate: monday,
    toDate: sunday,
    caregiverId: caregiverId || undefined,
    page: 0,
    size: WEEK_LIMIT
  }
  const schedules = useQuery({
    queryKey: [...providerKeys.centerSchedules(centerId), scheduleRequest],
    queryFn: () => fetchCenterSchedules(centerId, scheduleRequest),
    enabled: Boolean(centerId),
    placeholderData: keepPreviousData,
    retry: false
  })
  const scheduleListRequest = { ...scheduleRequest, page, size }
  const scheduleList = useQuery({
    queryKey: [...providerKeys.centerSchedules(centerId), 'list', scheduleListRequest],
    queryFn: () => fetchCenterSchedules(centerId, scheduleListRequest),
    enabled: Boolean(centerId) && view === 'list',
    placeholderData: keepPreviousData,
    retry: false
  })
  const weekTimeOffRequest = { from: weekFrom, to: weekTo, caregiverId: caregiverId || undefined, size: WEEK_LIMIT }
  const weekTimeOffs = useQuery({
    queryKey: [...providerKeys.centerTimeOffs(centerId), weekTimeOffRequest],
    queryFn: () => fetchCenterTimeOffs(centerId, weekTimeOffRequest),
    enabled: Boolean(centerId),
    placeholderData: keepPreviousData,
    retry: false
  })
  // "On leave now" for the numbers: a one-minute window at the moment the page opened.
  const nowIso = new Date(now).toISOString()
  const leaveNowRequest = { from: nowIso, to: new Date(now + 60_000).toISOString(), size: WEEK_LIMIT }
  const leaveNow = useQuery({
    queryKey: [...providerKeys.centerTimeOffs(centerId), 'now', leaveNowRequest],
    queryFn: () => fetchCenterTimeOffs(centerId, leaveNowRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const timeOffRequest = {
    ...(scope === 'week' ? { from: weekFrom, to: weekTo } : scope === 'past' ? { to: nowIso } : { from: nowIso }),
    caregiverId: caregiverId || undefined,
    page,
    size
  }
  const timeOffs = useQuery({
    queryKey: [...providerKeys.centerTimeOffs(centerId), 'tab', timeOffRequest],
    queryFn: () => fetchCenterTimeOffs(centerId, timeOffRequest),
    enabled: Boolean(centerId) && view === 'timeOff',
    placeholderData: keepPreviousData,
    retry: false
  })

  function update(values: Partial<Record<'view' | 'week' | 'caregiver' | 'scope' | 'page' | 'size', string>>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(values)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        // Any other change starts again from the first page.
        if (!('page' in values)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  return {
    view,
    monday,
    sunday,
    caregiverId,
    scope,
    caregivers,
    schedules,
    weekTimeOffs,
    leaveNow,
    timeOffs,
    scheduleList,
    page,
    size,
    truncated: (schedules.data?.totalElements ?? 0) > (schedules.data?.items.length ?? 0),
    setView: (value: CalendarView) => update({ view: value === 'team' ? '' : value }),
    setWeek: (day: string) => update({ week: mondayOf(day) === mondayOf(today) ? '' : mondayOf(day) }),
    setCaregiver: (value: string) => update({ caregiver: value }),
    setScope: (value: TimeOffScope) => update({ scope: value === 'current' ? '' : value }),
    setPage: (value: number) => update({ page: value > 0 ? String(value) : '' }),
    setSize: (value: number) => update({ size: value === 10 ? '' : String(value) })
  }
}

export type WorkCalendar = ReturnType<typeof useWorkCalendar>
