import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { bookingKeys, fetchBookingCollection } from '~/entities/booking/booking-api'

export interface BookingLabel {
  code: string
  recipientName?: string
}

/**
 * Payments carry only a booking ID; the customer's own bookings (the same cached query as the bookings list) turn it
 * into the booking code and the cared-for person's name. Until they load, rows show "View booking".
 */
export function useBookingLabels() {
  const bookings = useQuery({
    queryKey: bookingKeys.collection({}),
    queryFn: () => fetchBookingCollection(),
    retry: false
  })
  const labels = useMemo(
    () =>
      new Map<string, BookingLabel>(
        (bookings.data?.items ?? []).map((booking) => [
          booking.id,
          { code: booking.bookingCode, recipientName: booking.recipientName }
        ])
      ),
    [bookings.data]
  )
  return { bookings, labels }
}
