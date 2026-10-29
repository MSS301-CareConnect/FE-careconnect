import { useQuery } from '@tanstack/react-query'

import { isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'
import type { BookingDetailRecord, SearchProviderCaregiversParams } from '~/shared/api/generated/contracts'

// ProviderService search accepts at most 60 slots and 10 services per request.
const MAX_SLOTS = 60
const MAX_SERVICES = 10

/**
 * M-16: caregivers of the booking's center who provide all its services and are free (work shift, time off and other
 * bookings) for every upcoming visit. The booking's own caregiver counts as busy for its own visits, so callers mark
 * the current caregiver separately. Undefined while unknown; BookingService still checks again when saving.
 */
export function useFreeCaregivers(booking: BookingDetailRecord | undefined, enabled: boolean) {
  const slots = (booking?.occurrences ?? [])
    .filter((occurrence) => isUpcomingOccurrence(occurrence))
    .slice(0, MAX_SLOTS)
    .map((occurrence) => `${occurrence.startAt}/${occurrence.endAt}`)
  const careServiceIds = [...new Set((booking?.services ?? []).map((service) => service.careServiceId))].slice(
    0,
    MAX_SERVICES
  )
  const params: SearchProviderCaregiversParams = {
    centerId: booking?.centerId ?? '',
    careServiceIds,
    slots,
    page: 0,
    size: 50
  }
  const search = useQuery({
    queryKey: [...providerKeys.serviceCaregivers(params), 'free'],
    queryFn: () => searchCaregiversByService(params),
    enabled: enabled && Boolean(booking?.centerId) && slots.length > 0 && careServiceIds.length > 0,
    retry: false
  })
  const freeIds = search.data ? new Set(search.data.items.map((caregiver) => caregiver.caregiverId)) : undefined
  return { freeIds, checking: search.isFetching }
}
