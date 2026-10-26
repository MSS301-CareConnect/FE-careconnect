import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchMyOccurrences } from '~/entities/booking/booking-api'
import { OCCURRENCE_STATUSES, bookingDay } from '~/entities/booking/booking-format'
import type { ListMyBookingOccurrencesParams } from '~/shared/api/generated/contracts'

const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 20
export const VISIT_RANGES = ['upcoming', 'today', 'week', 'all'] as const
export type VisitRange = (typeof VISIT_RANGES)[number]

function rangeDates(range: VisitRange, now = Date.now()): Pick<ListMyBookingOccurrencesParams, 'from' | 'to'> {
  const today = bookingDay(new Date(now))
  if (range === 'today') return { from: today, to: today }
  if (range === 'week') return { from: today, to: bookingDay(new Date(now + 6 * DAY_MS)) }
  if (range === 'upcoming') return { from: today }
  return {}
}

/** Range, status and page live in the URL; BookingService returns only the caller's assigned visits. */
export function useCaregiverVisits() {
  const [params, setParams] = useSearchParams()
  const range = VISIT_RANGES.find((item) => item === params.get('range')) ?? VISIT_RANGES[0]
  const status = OCCURRENCE_STATUSES.find((item) => item === params.get('status'))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const request: ListMyBookingOccurrencesParams = { ...rangeDates(range), status, page, size: PAGE_SIZE }
  const visits = useQuery({
    queryKey: bookingKeys.occurrences(request),
    queryFn: () => fetchMyOccurrences(request),
    retry: false
  })

  function update(name: 'range' | 'status' | 'page', value: string) {
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
    visits,
    range,
    status,
    setRange: (value: VisitRange) => update('range', value === VISIT_RANGES[0] ? '' : value),
    setStatus: (value: string) => update('status', value),
    setPage: (value: number) => update('page', value > 0 ? String(value) : '')
  }
}
