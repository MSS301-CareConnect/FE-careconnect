import type { BookingStatus, BookingSummaryRecord } from '~/shared/api/generated/contracts'

/** A calendar day as `YYYY-MM-DD` (booking dates are local Vietnam dates, so no time zone math is involved). */
export type DayKey = string

export interface PlannedVisit {
  bookingId: string
  bookingCode: string
  status: BookingStatus
  recipientName?: string
  centerId?: string
  startTime: string
  endTime: string
}

function toUtc(day: DayKey) {
  const [year, month, date] = day.split('-').map(Number)
  return Date.UTC(year, month - 1, date)
}

function fromUtc(time: number): DayKey {
  return new Date(time).toISOString().slice(0, 10)
}

const DAY_MS = 86_400_000

/** First and last day of a `YYYY-MM` month. */
export function monthRange(month: string): { from: DayKey; to: DayKey } {
  const [year, monthNumber] = month.split('-').map(Number)
  const first = Date.UTC(year, monthNumber - 1, 1)
  const last = Date.UTC(year, monthNumber, 0)
  return { from: fromUtc(first), to: fromUtc(last) }
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return shifted.toISOString().slice(0, 7)
}

/** ISO weekday 1 (Monday) … 7 (Sunday), the convention of `BookingSummaryRecord.daysOfWeek`. */
export function isoWeekday(day: DayKey) {
  const weekday = new Date(toUtc(day)).getUTCDay()
  return weekday === 0 ? 7 : weekday
}

/** The 6×7 grid of a month view, Monday first, padded with the neighbouring months' days. */
export function monthGrid(month: string): DayKey[] {
  const { from } = monthRange(month)
  const start = toUtc(from) - (isoWeekday(from) - 1) * DAY_MS
  return Array.from({ length: 42 }, (_, index) => fromUtc(start + index * DAY_MS))
}

/**
 * Visits of each booking that fall inside `[from, to]`, built from the booking's schedule rule exactly as
 * BookingService's `OccurrenceGenerator` does: ONE_TIME on its start date, DAILY every day, WEEKLY on the ISO weekdays
 * of `daysOfWeek`. Per-visit changes (a cancelled visit, a reassigned caregiver) live in the booking detail.
 */
export function planVisits(bookings: readonly BookingSummaryRecord[], from: DayKey, to: DayKey) {
  const byDay = new Map<DayKey, PlannedVisit[]>()
  for (const booking of bookings) {
    const last = booking.scheduleType === 'ONE_TIME' ? booking.startDate : (booking.endDate ?? booking.startDate)
    const start = Math.max(toUtc(booking.startDate), toUtc(from))
    const end = Math.min(toUtc(last), toUtc(to))
    const weekdays = new Set(booking.daysOfWeek ?? [])
    for (let time = start; time <= end; time += DAY_MS) {
      const day = fromUtc(time)
      if (booking.scheduleType === 'WEEKLY' && !weekdays.has(isoWeekday(day))) continue
      const visits = byDay.get(day) ?? []
      visits.push({
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        recipientName: booking.recipientName,
        centerId: booking.centerId,
        startTime: booking.startTime,
        endTime: booking.endTime
      })
      byDay.set(day, visits)
    }
  }
  for (const visits of byDay.values()) visits.sort((a, b) => a.startTime.localeCompare(b.startTime))
  return byDay
}
