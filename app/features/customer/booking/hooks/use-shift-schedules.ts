import { useQuery } from '@tanstack/react-query'

import { bookingKeys, fetchHeldSchedules } from '~/entities/booking/booking-api'
import { bookingDay, shortTime } from '~/entities/booking/booking-format'
import { fetchBookableSchedules, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderBookableScheduleRecord } from '~/shared/api/generated/contracts'

import { DEFAULT_TRAVEL_BUFFER_MINUTES } from './service-slots'

/** A time range of another booking inside a shift's day, in Vietnam "HH:mm". */
export interface BusyRange {
  startTime: string
  endTime: string
}

const clockOf = (instant: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(instant))

/**
 * SHIFT (spec §3, reworked 2026-11-05): the caregiver's SCHEDULED shifts for the next 31 days from ProviderService, and
 * from BookingService the time other bookings already take and how many bookings each shift holds. A shift is split
 * into time slots; it is locked only once it holds `maxBookings` bookings (ProviderService's shift setting; a shift
 * without one takes a single booking, as BookingService assumes). BookingService checks again when the booking is sent.
 */
export function useShiftSchedules(caregiverId: string, enabled: boolean) {
  const active = enabled && Boolean(caregiverId)
  const schedules = useQuery({
    queryKey: providerKeys.bookableSchedules(caregiverId, {}),
    queryFn: () => fetchBookableSchedules(caregiverId),
    enabled: active,
    retry: false
  })
  const held = useQuery({
    queryKey: bookingKeys.heldSchedules({ caregiverId }),
    queryFn: () => fetchHeldSchedules({ caregiverId }),
    enabled: active,
    retry: false
  })

  const bufferMinutes = held.data?.travelBufferMinutes ?? DEFAULT_TRAVEL_BUFFER_MINUTES

  function bookingCount(schedule: ProviderBookableScheduleRecord) {
    return held.data?.scheduleBookingCounts?.[schedule.id] ?? 0
  }

  /** Bookings the shift still takes. An older BookingService without counts locks a shift it already holds. */
  function bookingsLeft(schedule: ProviderBookableScheduleRecord) {
    const max = schedule.maxBookings ?? 1
    const counts = held.data?.scheduleBookingCounts
    const taken = counts ? bookingCount(schedule) : held.data?.heldScheduleIds.includes(schedule.id) ? max : 0
    return Math.max(0, max - taken)
  }

  /** Other bookings of the caregiver on the shift's day, as same-day ranges (they also reserve the travel buffer). */
  function busyRanges(schedule: ProviderBookableScheduleRecord): BusyRange[] {
    return (held.data?.busySlots ?? [])
      .filter((slot) => bookingDay(new Date(slot.startAt)) === schedule.workDate)
      .map((slot) => ({ startTime: clockOf(slot.startAt), endTime: clockOf(slot.endAt) }))
      .filter((range) => range.startTime < range.endTime || range.endTime === '00:00')
      .map((range) => (range.endTime === '00:00' ? { ...range, endTime: '24:00' } : range))
  }

  return {
    schedules,
    held,
    bufferMinutes,
    bookingsLeft,
    busyRanges,
    timeOf: (schedule: ProviderBookableScheduleRecord) =>
      `${shortTime(schedule.startTime)}–${shortTime(schedule.endTime)}`
  }
}
