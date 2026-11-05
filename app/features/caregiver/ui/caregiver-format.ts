import { useTranslation } from 'react-i18next'

import {
  addDays,
  calendarDayOf,
  dateLocale,
  formatCalendarDate,
  formatClock24,
  formatShortDate,
  isoWeekday
} from '~/shared/lib/format'
import { formatPhone } from '~/shared/lib/phone'

export { addDays, calendarDayOf, isoWeekday }

type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Monday (YYYY-MM-DD) of the week that holds a calendar day. */
export function weekStart(day: string) {
  return addDays(day, 1 - isoWeekday(day))
}

/** First day of the month that holds a calendar day. */
export function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`
}

/** Last day of the month that holds a calendar day. */
export function monthEnd(day: string) {
  const date = new Date(`${monthStart(day)}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + 1)
  date.setUTCDate(0)
  return date.toISOString().slice(0, 10)
}

/** "08:00" from an "08:00:00" time of day. */
export function hhmm(time: string | undefined) {
  return time ? time.slice(0, 5) : ''
}

/** Minutes between two instants. */
export function minutesBetweenInstants(start: string, end: string) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000))
}

/** Minutes of an "HH:mm(:ss)" range on one day. */
export function minutesOfTimes(start: string, end: string) {
  const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
  return Math.max(0, toMinutes(end) - toMinutes(start))
}

// Phone grouping moved to shared/lib/phone (used by every portal); re-exported for the caregiver screens.
export { formatPhone }

/** A Google Maps directions link for an address the caregiver opens on their phone. */
export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/** Display formats of the caregiver portal: dd/mm/yyyy, 24-hour clock, "T6, 08/11", "Hôm nay". */
export function useCaregiverFormat() {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  const weekday = (day: string) => t(`caregiver.ui.weekdays.${isoWeekday(day) as Weekday}`)
  const weekdayLong = (day: string) => t(`caregiver.ui.weekdaysLong.${isoWeekday(day) as Weekday}`)
  const shortDay = (day: string) => `${weekday(day)}, ${formatShortDate(day)}`

  function duration(minutes: number) {
    if (minutes <= 0) return t('caregiver.ui.duration.minutes', { count: 0 })
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours && rest) return t('caregiver.ui.duration.hoursMinutes', { hours, minutes: rest })
    if (hours) return t('caregiver.ui.duration.hours', { count: hours })
    return t('caregiver.ui.duration.minutes', { count: rest })
  }

  /** A remaining time as "45 phút", "2 giờ 10 phút" or "3 ngày". */
  function remaining(ms: number) {
    const minutes = Math.max(0, Math.ceil(ms / 60_000))
    if (minutes >= 48 * 60) return t('caregiver.ui.countdown.days', { count: Math.floor(minutes / (24 * 60)) })
    return duration(minutes)
  }

  /** "Hôm nay", "Ngày mai", "Hôm qua" or "T6, 08/11" for a calendar day. */
  function relativeDay(day: string, today: string) {
    if (day === today) return t('caregiver.ui.relative.today')
    if (day === addDays(today, 1)) return t('caregiver.ui.relative.tomorrow')
    if (day === addDays(today, -1)) return t('caregiver.ui.relative.yesterday')
    return shortDay(day)
  }

  /** "5 phút trước" / "in 3 hours" for an instant, falling back to the date after a week. */
  function relativeTime(value: string | undefined, now: number) {
    if (!value) return ''
    const diff = new Date(value).getTime() - now
    const minutes = Math.round(diff / 60_000)
    const format = new Intl.RelativeTimeFormat(dateLocale(language), { numeric: 'auto' })
    if (Math.abs(minutes) < 60) return format.format(minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return format.format(hours, 'hour')
    const days = Math.round(hours / 24)
    if (Math.abs(days) < 7) return format.format(days, 'day')
    return formatCalendarDate(value)
  }

  return {
    language,
    date: (value: string | undefined) => formatCalendarDate(value),
    clock: (value: string | undefined) => formatClock24(value, language),
    weekday,
    weekdayLong,
    shortDay,
    relativeDay,
    relativeTime,
    duration,
    remaining,
    /** "08:00–20:00" from two instants. */
    clockRange: (start: string, end: string) => `${formatClock24(start, language)}–${formatClock24(end, language)}`,
    /** "08:00–20:00 · 12 giờ" from two instants. */
    clockRangeWithDuration: (start: string, end: string) =>
      `${formatClock24(start, language)}–${formatClock24(end, language)} · ${duration(minutesBetweenInstants(start, end))}`,
    /** "08:00–20:00 · 12 giờ" from two times of day. */
    timeRangeWithDuration: (start: string, end: string) =>
      `${hhmm(start)}–${hhmm(end)} · ${duration(minutesOfTimes(start, end))}`,
    /** "10:26 · T6, 06/11" from an instant. */
    shortDateTime: (value: string | undefined) =>
      value ? `${formatClock24(value, language)} · ${shortDay(calendarDayOf(value))}` : '',
    phone: formatPhone
  }
}
