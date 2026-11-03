import { useQuery } from '@tanstack/react-query'

import { bookingKeys, fetchBookings } from '~/entities/booking/booking-api'
import type { ListBookingsParams } from '~/shared/api/generated/contracts'

/** Bookings that wait on the customer: the initial payment after the center confirmed. */
export const ATTENTION_REQUEST: ListBookingsParams = { status: 'AWAITING_INITIAL_PAYMENT', page: 0, size: 1 }

export function useBookingsAttention(enabled: boolean) {
  const query = useQuery({
    queryKey: bookingKeys.list(ATTENTION_REQUEST),
    queryFn: () => fetchBookings(ATTENTION_REQUEST),
    enabled,
    retry: false,
    staleTime: 60_000
  })
  return query.data?.totalElements ?? 0
}
