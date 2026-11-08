import type { BookingItemRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'

import { calendarDayOf, minutesBetweenInstants } from '../ui/caregiver-format'

/** Visits of a booking request in time order. */
export function sortedVisits(occurrences: BookingOccurrenceRecord[] | undefined) {
  return [...(occurrences ?? [])].sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export function visitMinutes(visit: BookingOccurrenceRecord) {
  return visit.durationMinutes ?? minutesBetweenInstants(visit.startAt, visit.endAt)
}

export function totalMinutes(visits: BookingOccurrenceRecord[]) {
  return visits.reduce((sum, visit) => sum + visitMinutes(visit), 0)
}

/** First and last calendar day of the visits (Vietnam time), or undefined without visits. */
export function visitDays(visits: BookingOccurrenceRecord[]) {
  const first = visits[0]
  const last = visits[visits.length - 1]
  if (!first || !last) return undefined
  return { first: calendarDayOf(first.startAt), last: calendarDayOf(last.startAt) }
}

/**
 * Name of the service a visit is for. A visit without `careServiceId` covers every service of the booking, so it
 * shows the single service name, or undefined (the caller says "all booked services").
 */
export function visitServiceName(visit: BookingOccurrenceRecord, services: BookingItemRecord[] | undefined) {
  const items = services ?? []
  if (visit.careServiceId) return items.find((item) => item.careServiceId === visit.careServiceId)?.serviceName
  return items.length === 1 ? items[0]?.serviceName : undefined
}

/** "MALE" / "FEMALE" / "OTHER" or undefined: gender is an enum and is always shown through i18n. */
export function genderCode(value: string | undefined) {
  return value === 'MALE' || value === 'FEMALE' || value === 'OTHER' ? value : undefined
}
