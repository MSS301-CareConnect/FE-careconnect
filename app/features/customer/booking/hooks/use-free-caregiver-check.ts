import { useQueries, useQuery } from '@tanstack/react-query'

import { vietnamInstant } from '~/entities/booking/booking-format'
import { providerKeys, searchCaregiversByService } from '~/entities/provider/provider-api'

import type { CustomSlot } from './schedule-slots'

/** `/caregivers/search` takes at most 60 time slots per request. */
const MAX_SLOTS = 60

/**
 * IDs of the center's caregivers who do every listed service and are free for every slot (`<startISO>/<endISO>`):
 * approved shift, no time off, no other booking — the rule BookingService auto-assigns by. Long lists are asked in
 * chunks and intersected; only the first page of 50 is read per chunk.
 */
async function freeCaregiverIds(centerId: string, careServiceIds: string[], slots: string[]) {
  let free: string[] = []
  for (let from = 0; from < slots.length; from += MAX_SLOTS) {
    const page = await searchCaregiversByService({
      centerId,
      careServiceIds,
      slots: slots.slice(from, from + MAX_SLOTS),
      page: 0,
      size: 50
    })
    const ids = page.items.map((item) => item.caregiverId)
    free = from === 0 ? ids : free.filter((id) => ids.includes(id))
    if (free.length === 0) break
  }
  return free
}

const freeKey = (centerId: string, serviceIds: string[], slots: string[]) =>
  [...providerKeys.catalog, 'free-check', centerId, serviceIds, slots] as const

/**
 * Review step, "let the center assign" (2026-11-13): `noneFree` when no caregiver is free for all the quoted visits.
 */
export function useFreeCaregiverCheck(
  centerId: string,
  careServiceIds: readonly string[],
  visits: readonly { startAt?: string; endAt?: string }[],
  enabled: boolean
) {
  const slots = visits.flatMap((visit) => (visit.startAt && visit.endAt ? [`${visit.startAt}/${visit.endAt}`] : []))
  const serviceIds = [...careServiceIds].sort()
  const check = useQuery({
    queryKey: freeKey(centerId, serviceIds, slots),
    queryFn: async () => (await freeCaregiverIds(centerId, serviceIds, slots)).length,
    enabled: enabled && Boolean(centerId) && serviceIds.length > 0 && slots.length > 0,
    retry: false,
    staleTime: 60_000
  })
  return { noneFree: check.data === 0 }
}

export type VisitAvailability = 'unavailable' | 'noneFree'

const slotKey = (slot: CustomSlot) => `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.careServiceId ?? ''}`

/**
 * Schedule step (2026-11-13): which planned visits nobody can take. With a chosen caregiver a visit is `unavailable`
 * when that caregiver has no approved shift, is off or is booked elsewhere then; when the center assigns, a visit is
 * `noneFree` when no caregiver of the center is free. The whole list is asked once; only when that fails is each visit
 * asked on its own (its own service with several services), so a normal booking costs one or two requests.
 * `checkable` drops visits that already have a form error (no date, too soon…).
 */
export function useVisitAvailability(
  centerId: string,
  careServiceIds: readonly string[],
  caregiverId: string | undefined,
  slots: readonly CustomSlot[],
  checkable: (slot: CustomSlot) => boolean
) {
  const serviceIds = [...careServiceIds].sort()
  const visits = [...new Map(slots.filter(checkable).map((slot) => [slotKey(slot), slot])).values()].map((slot) => ({
    key: slotKey(slot),
    range: `${vietnamInstant(slot.date, slot.startTime)}/${vietnamInstant(slot.date, slot.endTime)}`,
    serviceIds: slot.careServiceId ? [slot.careServiceId] : serviceIds
  }))
  const enabled = Boolean(centerId) && serviceIds.length > 0 && visits.length > 0
  const ranges = visits.map((visit) => visit.range)
  const whole = useQuery({
    queryKey: freeKey(centerId, serviceIds, ranges),
    queryFn: () => freeCaregiverIds(centerId, serviceIds, ranges),
    enabled,
    retry: false,
    staleTime: 60_000
  })
  const wholeFine = whole.data && (caregiverId ? whole.data.includes(caregiverId) : whole.data.length > 0)
  const each = useQueries({
    queries: visits.map((visit) => ({
      queryKey: freeKey(centerId, visit.serviceIds, [visit.range]),
      queryFn: () => freeCaregiverIds(centerId, visit.serviceIds, [visit.range]),
      enabled: enabled && whole.isSuccess && !wholeFine,
      retry: false,
      staleTime: 60_000
    }))
  })
  const byKey = new Map(visits.map((visit, index) => [visit.key, each[index]?.data]))

  function availabilityOf(slot: CustomSlot): VisitAvailability | null {
    if (!whole.isSuccess || wholeFine) return null
    const ids = byKey.get(slotKey(slot))
    if (!ids) return null
    if (caregiverId) return ids.includes(caregiverId) ? null : 'unavailable'
    return ids.length === 0 ? 'noneFree' : null
  }

  return { availabilityOf, checking: whole.isFetching || each.some((query) => query.isFetching) }
}
