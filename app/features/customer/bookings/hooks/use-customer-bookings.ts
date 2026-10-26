import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchBookings } from '~/entities/booking/booking-api'
import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import type { ListBookingsParams } from '~/shared/api/generated/contracts'

const PAGE_SIZE = 10
export const BOOKING_SORTS = ['createdAt,desc', 'startDate,asc', 'startDate,desc'] as const
export type BookingSort = (typeof BOOKING_SORTS)[number]

/** Status, keyword, sort and page live in the URL; BookingService filters and paginates. */
export function useCustomerBookings() {
  const [params, setParams] = useSearchParams()
  const status = BOOKING_STATUSES.find((item) => item === params.get('status'))
  const keyword = params.get('q') ?? ''
  const sort = BOOKING_SORTS.find((item) => item === params.get('sort')) ?? BOOKING_SORTS[0]
  const page = Math.max(0, Number(params.get('page')) || 0)
  const request: ListBookingsParams = {
    status,
    keyword: keyword.trim() || undefined,
    sort,
    page,
    size: PAGE_SIZE
  }
  const bookings = useQuery({
    queryKey: bookingKeys.list(request),
    queryFn: () => fetchBookings(request),
    retry: false
  })

  function update(name: 'status' | 'q' | 'sort' | 'page', value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(name, value)
        else next.delete(name)
        if (name !== 'page') next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  return {
    bookings,
    status,
    keyword,
    sort,
    hasFilters: Boolean(status || request.keyword),
    setStatus: (value: string) => update('status', value),
    setKeyword: (value: string) => update('q', value.trim()),
    setSort: (value: BookingSort) => update('sort', value === BOOKING_SORTS[0] ? '' : value),
    setPage: (value: number) => update('page', value > 0 ? String(value) : ''),
    reset: () => setParams({}, { replace: true })
  }
}
