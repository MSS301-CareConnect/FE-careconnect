import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchBookings } from '~/entities/booking/booking-api'
import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import type { ListBookingsParams } from '~/shared/api/generated/contracts'

const PAGE_SIZE = 20
const DATE = /^\d{4}-\d{2}-\d{2}$/
export const MANAGER_SORTS = ['createdAt,desc', 'startDate,asc'] as const
export type ManagerSort = (typeof MANAGER_SORTS)[number]
const pendingRequest: ListBookingsParams = { status: 'PENDING', page: 0, size: 1 }

/**
 * Filters live in the URL. BookingService scopes the list to the manager's center from the session,
 * so the request never sends a centerId.
 */
export function useManagerBookings() {
  const [params, setParams] = useSearchParams()
  const status = BOOKING_STATUSES.find((item) => item === params.get('status'))
  const keyword = params.get('q') ?? ''
  const from = DATE.test(params.get('from') ?? '') ? (params.get('from') ?? undefined) : undefined
  const to = DATE.test(params.get('to') ?? '') ? (params.get('to') ?? undefined) : undefined
  const sort = MANAGER_SORTS.find((item) => item === params.get('sort')) ?? MANAGER_SORTS[0]
  const page = Math.max(0, Number(params.get('page')) || 0)
  const request: ListBookingsParams = {
    status,
    keyword: keyword.trim() || undefined,
    from,
    to,
    sort,
    page,
    size: PAGE_SIZE
  }

  const bookings = useQuery({
    queryKey: bookingKeys.list(request),
    queryFn: () => fetchBookings(request),
    retry: false
  })
  // The review queue count stays visible whatever filter is active.
  const pending = useQuery({
    queryKey: bookingKeys.list(pendingRequest),
    queryFn: () => fetchBookings(pendingRequest),
    retry: false
  })

  function update(values: Partial<Record<'status' | 'q' | 'from' | 'to' | 'sort' | 'page', string>>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(values)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in values)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  return {
    bookings,
    pendingCount: pending.data?.totalElements,
    status,
    keyword,
    from,
    to,
    sort,
    hasFilters: Boolean(status || request.keyword || from || to),
    setStatus: (value: string) => update({ status: value }),
    setKeyword: (value: string) => update({ q: value.trim() }),
    setRange: (nextFrom: string, nextTo: string) => update({ from: nextFrom, to: nextTo }),
    setSort: (value: ManagerSort) => update({ sort: value === MANAGER_SORTS[0] ? '' : value }),
    setPage: (value: number) => update({ page: value > 0 ? String(value) : '' }),
    reset: () => setParams({}, { replace: true })
  }
}
