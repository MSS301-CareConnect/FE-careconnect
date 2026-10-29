import type { BookingStatus, OccurrenceStatus } from '~/shared/api/generated/contracts'

import { bookingErrorCode, bookingErrorStatus } from './booking-api'

/** BookingService stores occurrences as instants and schedules every booking in Vietnam time. */
export const BOOKING_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export const BOOKING_STATUSES = [
  'PENDING',
  'AWAITING_DEPOSIT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED'
] as const satisfies readonly BookingStatus[]

export const OCCURRENCE_STATUSES = [
  'SCHEDULED',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'MISSED',
  'CUSTOMER_NO_SHOW'
] as const satisfies readonly OccurrenceStatus[]

/** ISO weekdays as BookingService stores them: 1 = Monday … 7 = Sunday. */
export const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const

export function weekdayKey(day: number) {
  return WEEKDAYS.find((item) => item === String(day))
}

/** True once the scheduled start of a visit has passed. */
export function hasStarted(startAt: string, now = Date.now()) {
  return new Date(startAt).getTime() <= now
}

/** Occurrences that have not started yet and can still be cancelled or reassigned. */
export function isUpcomingOccurrence(occurrence: { status: OccurrenceStatus; startAt: string }, now = Date.now()) {
  return (
    (occurrence.status === 'SCHEDULED' || occurrence.status === 'ACKNOWLEDGED') &&
    new Date(occurrence.startAt).getTime() > now
  )
}

export function formatMoney(value: number | undefined, language: string) {
  return new Intl.NumberFormat(language, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    value ?? 0
  )
}

/** Formats a calendar date (YYYY-MM-DD) without shifting it through the browser time zone. */
export function formatDay(value: string | undefined, language: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`))
}

export function formatDateTime(value: string | undefined, language: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BOOKING_TIME_ZONE
  }).format(new Date(value))
}

/** Weekday and date of an instant in Vietnam time, without the clock. */
export function formatDate(value: string | undefined, language: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: BOOKING_TIME_ZONE
  }).format(new Date(value))
}

export function formatClock(value: string | undefined, language: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit', timeZone: BOOKING_TIME_ZONE }).format(
    new Date(value)
  )
}

/** LocalTime values arrive as HH:mm or HH:mm:ss; the UI shows HH:mm. */
export function shortTime(value: string | undefined) {
  return value ? value.slice(0, 5) : ''
}

/** YYYY-MM-DD of an instant in Vietnam time, used for date filters. */
export function bookingDay(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BOOKING_TIME_ZONE }).format(value)
}

const KNOWN_ERROR_CODES = [
  5004, 5006, 5007, 5100, 5101, 5102, 5107, 5110, 5157, 5150, 5151, 5153, 5154, 5159, 5205, 5206, 5207, 5208, 5211,
  5212, 5213, 5214, 5215, 5216, 5218, 5221, 5222, 5223, 5225, 5226, 5228, 5234, 5235, 5236, 5300, 5301, 5302, 5400,
  5403, 5404, 5405, 5406, 5408, 5601, 5602, 5700, 5801, 5802, 5804, 5805, 5812, 5813, 5814, 5817, 5822
] as const

export type BookingErrorKey =
  | `booking.errors.e${(typeof KNOWN_ERROR_CODES)[number]}`
  | 'booking.errors.forbidden'
  | 'booking.errors.unavailable'
  | 'booking.errors.generic'

/** Maps a BookingService failure to a translated message instead of showing backend text. */
export function bookingErrorKey(error: unknown): BookingErrorKey {
  const code = bookingErrorCode(error)
  const known = KNOWN_ERROR_CODES.find((item) => item === code)
  if (known) return `booking.errors.e${known}`
  const status = bookingErrorStatus(error)
  if (status === 403) return 'booking.errors.forbidden'
  if (status === 503) return 'booking.errors.unavailable'
  return 'booking.errors.generic'
}
