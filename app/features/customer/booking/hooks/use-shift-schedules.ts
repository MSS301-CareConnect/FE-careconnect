import { useQuery } from '@tanstack/react-query'

import { bookingKeys, fetchHeldSchedules } from '~/entities/booking/booking-api'
import { vietnamInstant } from '~/entities/booking/booking-format'
import { fetchBookableSchedules, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderBookableScheduleRecord } from '~/shared/api/generated/contracts'

/**
 * SHIFT (spec §3): the caregiver's SCHEDULED shifts for the next 31 days from ProviderService, and from BookingService
 * which of them a booking already holds or overlaps another booking. Held shifts stay visible but cannot be picked;
 * BookingService checks again when the booking is sent.
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

  function isHeld(schedule: ProviderBookableScheduleRecord) {
    if (held.data?.heldScheduleIds.includes(schedule.id)) return true
    const start = Date.parse(vietnamInstant(schedule.workDate, schedule.startTime.slice(0, 5)))
    const end = Date.parse(vietnamInstant(schedule.workDate, schedule.endTime.slice(0, 5)))
    return (held.data?.busySlots ?? []).some((slot) => Date.parse(slot.startAt) < end && start < Date.parse(slot.endAt))
  }

  return { schedules, held, isHeld }
}
