import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  bookingKeys,
  fetchCaregiverBookingRequest,
  fetchCaregiverBookingRequests,
  fetchMyOccurrences
} from '~/entities/booking/booking-api'
import {
  fetchMyCaregiverProfile,
  fetchMySchedules,
  fetchMyShiftRegistrations,
  fetchProviderMedia,
  fetchWorkShift,
  fetchWorkShifts,
  providerKeys
} from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { fetchDepositForfeitureSummary, fetchDepositForfeitures, paymentKeys } from '~/entities/payment/payment-api'
import type {
  ListMyBookingOccurrencesParams,
  OccurrenceStatus,
  ProviderScheduleRecord
} from '~/shared/api/generated/contracts'
import { calendarDayOf } from '~/shared/lib/format'

/** BookingService caps a page at 100 visits. */
export const VISIT_PAGE_SIZE = 100

/** Visits still ahead of the caregiver: accepted or not, or running now. */
export const ACTIVE_VISIT_STATUSES: ReadonlySet<OccurrenceStatus> = new Set([
  'SCHEDULED',
  'ACKNOWLEDGED',
  'IN_PROGRESS'
])
export const DONE_VISIT_STATUSES: ReadonlySet<OccurrenceStatus> = new Set([
  'COMPLETED',
  'CUSTOMER_NO_SHOW',
  'CAREGIVER_MISSED'
])
export const CANCELLED_VISIT_STATUSES: ReadonlySet<OccurrenceStatus> = new Set(['CANCELLED', 'EXPIRED'])

/** Today's calendar day in Vietnam time, fixed when the component mounts. */
export function useToday() {
  const [today] = useState(() => calendarDayOf(new Date()))
  return today
}

export function useMyCaregiverProfile() {
  return useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
}

/** The caregiver's profile photo (newest image), or undefined while there is none. */
export function useMyAvatar(profileId: string | undefined) {
  const media = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', profileId ?? ''),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', profileId ?? ''),
    enabled: Boolean(profileId),
    retry: false
  })
  return { media, url: pickAvatar(media.data)?.downloadUrl }
}

/** One page of the caregiver's own visits; the query key matches the rest of the booking cache. */
export function useVisitPage(params: ListMyBookingOccurrencesParams, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.occurrences(params),
    queryFn: () => fetchMyOccurrences(params),
    enabled,
    retry: false
  })
}

/** Every page of a visit range, loaded on demand ("Tải thêm"). */
export function useVisitPages(params: Omit<ListMyBookingOccurrencesParams, 'page' | 'size'>) {
  return useInfiniteQuery({
    queryKey: [...bookingKeys.occurrences({ ...params, size: VISIT_PAGE_SIZE }), 'pages'],
    queryFn: ({ pageParam }) => fetchMyOccurrences({ ...params, page: pageParam, size: VISIT_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
    retry: false
  })
}

/** Visits from today the center assigned but the caregiver has not accepted yet. */
export function useVisitsToAccept(today: string) {
  return useVisitPage({ from: today, status: 'SCHEDULED', page: 0, size: VISIT_PAGE_SIZE })
}

/** CR-3: bookings customers sent straight to this caregiver, still waiting for an answer (newest 50). */
export function useBookingRequests() {
  return useQuery({
    queryKey: bookingKeys.caregiverRequests(0),
    queryFn: () => fetchCaregiverBookingRequests(0),
    retry: false,
    refetchInterval: 60_000
  })
}

/** One booking still waiting for this caregiver's answer; 404 once answered, expired or handed over. */
export function useCaregiverRequest(id: string) {
  return useQuery({
    queryKey: bookingKeys.caregiverRequest(id),
    queryFn: () => fetchCaregiverBookingRequest(id),
    retry: false
  })
}

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

export function useMySchedules(enabled = true) {
  return useQuery({
    queryKey: [...providerKeys.mySchedules, 'all'],
    queryFn: fetchAllMySchedules,
    enabled,
    retry: false
  })
}

/**
 * The work shift a SHIFT visit belongs to: the caregiver's schedule (from the shared schedule list) and its shift for
 * the type ("Ca sáng"). Either part may be missing; callers fall back to the schedule's or the visit's own hours.
 */
export function useVisitShift(scheduleId: string | undefined) {
  const schedules = useMySchedules(Boolean(scheduleId))
  const schedule = scheduleId ? schedules.data?.find((item) => item.id === scheduleId) : undefined
  const workShiftId = schedule?.workShiftId
  const shift = useQuery({
    queryKey: providerKeys.shift(workShiftId ?? ''),
    queryFn: () => fetchWorkShift(workShiftId ?? ''),
    enabled: Boolean(workShiftId),
    retry: false
  })
  return { schedule, shift: shift.data, loading: schedules.isPending && Boolean(scheduleId) }
}

/** CR-4: the caregiver's share of deposits kept from customers in a period, with the rows page by page. */
export function useKeptDeposits(from: string, to: string) {
  const summary = useQuery({
    queryKey: paymentKeys.forfeitureSummary(from, to),
    queryFn: () => fetchDepositForfeitureSummary(from, to),
    retry: false
  })
  const rows = useInfiniteQuery({
    queryKey: [...paymentKeys.forfeitures(from, to, 0), 'pages'],
    queryFn: ({ pageParam }) => fetchDepositForfeitures(from, to, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
    retry: false
  })
  return { summary, rows }
}

/** Open shifts of the caregiver's center and the caregiver's latest registrations (first 100 of each). */
export function useOpenShifts(centerId: string | undefined) {
  return useQuery({
    queryKey: [...providerKeys.shifts(centerId ?? ''), 'OPEN', 'first-100'],
    queryFn: () => fetchWorkShifts({ centerId, status: 'OPEN', page: 0, size: 100 }),
    enabled: Boolean(centerId),
    retry: false
  })
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: [...providerKeys.myRegistrations, 'first-100'],
    queryFn: () => fetchMyShiftRegistrations({ page: 0, size: 100 }),
    retry: false
  })
}
