import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { bookingKeys, fetchCaregiverBookingRequests, fetchMyOccurrences } from '~/entities/booking/booking-api'
import {
  fetchMyCaregiverProfile,
  fetchMyShiftRegistrations,
  fetchProviderMedia,
  fetchWorkShifts,
  providerKeys
} from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { fetchDepositForfeitureSummary, fetchDepositForfeitures, paymentKeys } from '~/entities/payment/payment-api'
import type { ListMyBookingOccurrencesParams, OccurrenceStatus } from '~/shared/api/generated/contracts'
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
