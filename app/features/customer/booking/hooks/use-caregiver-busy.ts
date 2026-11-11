import { useQueries } from '@tanstack/react-query'

import { bookingKeys, fetchHeldSchedules } from '~/entities/booking/booking-api'
import { vietnamInstant } from '~/entities/booking/booking-format'
import { addDays } from '~/shared/lib/format'

import { DEFAULT_TRAVEL_BUFFER_MINUTES } from './service-slots'

/** BookingService reads at most 31 days of a caregiver's busy time per request. */
const BLOCK_DAYS = 31
const DAY_MS = 24 * 60 * 60 * 1000

export type BusyConflict = 'busy' | 'buffer'

/**
 * The time the chosen caregiver already gives to other bookings (`GET /bookings/held-schedules`), for the days of the
 * visits being planned (2026-11-11). Blocks of 31 days are counted from `anchorDay`, so the form and the pattern
 * builder share the same cached requests. A visit overlapping another booking is `busy`; one inside the travel buffer
 * around it is `buffer`. Time off is not public: BookingService reports it on the quote. Without a caregiver (the
 * center assigns one) nothing is read.
 */
export function useCaregiverBusy(caregiverId: string | undefined, anchorDay: string, days: readonly string[]) {
  const anchor = Date.parse(`${anchorDay}T00:00:00Z`)
  const blocks = [
    ...new Set(
      days
        .filter((day) => day >= anchorDay)
        .map((day) => Math.floor((Date.parse(`${day}T00:00:00Z`) - anchor) / DAY_MS / BLOCK_DAYS))
    )
  ].sort((a, b) => a - b)
  const queries = useQueries({
    queries: blocks.map((block) => {
      const params = {
        caregiverId: caregiverId ?? '',
        from: addDays(anchorDay, block * BLOCK_DAYS),
        to: addDays(anchorDay, block * BLOCK_DAYS + BLOCK_DAYS - 1)
      }
      return {
        queryKey: bookingKeys.heldSchedules(params),
        queryFn: () => fetchHeldSchedules(params),
        enabled: Boolean(caregiverId),
        retry: false,
        staleTime: 30_000
      }
    })
  })

  const ranges = queries.flatMap((query) =>
    (query.data?.busySlots ?? []).map((slot) => ({ start: Date.parse(slot.startAt), end: Date.parse(slot.endAt) }))
  )
  const bufferMs =
    (queries.find((query) => query.data)?.data?.travelBufferMinutes ?? DEFAULT_TRAVEL_BUFFER_MINUTES) * 60_000

  function conflictOf(slot: { date: string; startTime: string; endTime: string }): BusyConflict | null {
    if (!caregiverId || !slot.date || slot.endTime <= slot.startTime) return null
    const start = Date.parse(vietnamInstant(slot.date, slot.startTime))
    const end = Date.parse(vietnamInstant(slot.date, slot.endTime))
    // Half-open ranges, as BookingService checks: a visit ending as another starts is free.
    if (ranges.some((range) => start < range.end && range.start < end)) return 'busy'
    if (ranges.some((range) => start < range.end + bufferMs && range.start - bufferMs < end)) return 'buffer'
    return null
  }

  return {
    conflictOf,
    bufferMinutes: bufferMs / 60_000,
    checking: queries.some((query) => query.isFetching),
    failed: queries.some((query) => query.isError)
  }
}
