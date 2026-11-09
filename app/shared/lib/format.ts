import { useTranslation } from 'react-i18next'

/**
 * Display formats shared by the customer portal (2026-11 redesign): money "100.000 ₫", dates "20/05/1945", 24-hour
 * clock "08:00" and "08:00 · T6, 06/11/2026". English uses the same day-first order (en-GB) so a date never flips
 * between screens. Calendar dates (YYYY-MM-DD) are formatted without passing through the browser time zone.
 */
export const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export function dateLocale(language: string) {
  return language.startsWith('en') ? 'en-GB' : 'vi-VN'
}

export function formatCurrency(value: number | undefined, language: string) {
  return new Intl.NumberFormat(dateLocale(language), {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value ?? 0)
}

/** Day, month and year of a date in a zone, always joined as dd/mm(/yyyy) whatever the locale's separator. */
function dayParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone
  }).formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return { day: pick('day'), month: pick('month'), year: pick('year') }
}

/** "20/05/1945" from a calendar date (YYYY-MM-DD) or an instant. The language does not change the order. */
export function formatCalendarDate(value: string | undefined) {
  if (!value) return ''
  const calendarOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = calendarOnly ? new Date(`${value}T00:00:00Z`) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const { day, month, year } = dayParts(date, calendarOnly ? 'UTC' : APP_TIME_ZONE)
  return `${day}/${month}/${year}`
}

/** "06/11" from a calendar date. */
export function formatShortDate(value: string | undefined) {
  if (!value) return ''
  const { day, month } = dayParts(new Date(`${value}T00:00:00Z`), 'UTC')
  return `${day}/${month}`
}

/** "08:00" (24-hour) from an instant, in Vietnam time. */
export function formatClock24(value: string | undefined, language: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(dateLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: APP_TIME_ZONE
  }).format(new Date(value))
}

/** ISO weekday (1 = Monday … 7 = Sunday) of a calendar date. */
export function isoWeekday(day: string) {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay()
  return weekday === 0 ? 7 : weekday
}

/** YYYY-MM-DD of an instant in Vietnam time. */
export function calendarDayOf(value: Date | string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIME_ZONE }).format(new Date(value))
}

/** Adds whole days to a calendar date. */
export function addDays(day: string, amount: number) {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

/** Minutes between two HH:mm values on the same day; negative or zero when the range is empty. */
export function minutesBetween(start: string, end: string) {
  const [startHours, startMinutes] = start.split(':').map(Number)
  const [endHours, endMinutes] = end.split(':').map(Number)
  return endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
}

/** HH:mm plus minutes, capped at 23:59 when the sum passes midnight. */
export function addMinutesToTime(time: string, minutes: number) {
  const total = Math.min(23 * 60 + 59, minutesBetween('00:00', time) + minutes)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Formatters that need translated words (weekday, "hours"), bound to the active language. */
export function useFormat() {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  function weekday(day: string) {
    return t(`booking.weekdays.${isoWeekday(day) as 1 | 2 | 3 | 4 | 5 | 6 | 7}`)
  }

  function longWeekday(day: string) {
    return t(`bookingSchedule.weekdaysLong.${isoWeekday(day) as 1 | 2 | 3 | 4 | 5 | 6 | 7}`)
  }

  /** "Hôm nay" / "Ngày mai" when `day` is today or tomorrow (both calendar dates), otherwise null. */
  function relativeDay(day: string, today: string) {
    if (day === today) return t('bookingSchedule.relative.today')
    if (day === addDays(today, 1)) return t('bookingSchedule.relative.tomorrow')
    return null
  }

  function duration(minutes: number) {
    if (minutes <= 0) return ''
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours && rest) return t('common.format.hoursMinutes', { hours, minutes: rest })
    if (hours) return t('common.format.hours', { count: hours })
    return t('common.format.minutes', { count: rest })
  }

  return {
    language,
    money: (value: number | undefined) => formatCurrency(value, language),
    date: (value: string | undefined) => formatCalendarDate(value),
    shortDate: (value: string | undefined) => formatShortDate(value),
    clock: (value: string | undefined) => formatClock24(value, language),
    weekday,
    /** "T6, 06/11/2026" from a calendar date. */
    dayLabel: (day: string) => `${weekday(day)}, ${formatCalendarDate(day)}`,
    /** "T6, 06/11" from a calendar date. */
    shortDayLabel: (day: string) => `${weekday(day)}, ${formatShortDate(day)}`,
    /** "08:00 · T6, 06/11/2026" from an instant. */
    dateTime: (value: string | undefined) =>
      value ? `${formatClock24(value, language)} · ${weekday(calendarDayOf(value))}, ${formatCalendarDate(value)}` : '',
    duration,
    /** "T6, 06/11/2026 · 08:00–10:00" from two instants of the same visit. */
    visitRange: (startAt: string | undefined, endAt: string | undefined) =>
      startAt
        ? `${weekday(calendarDayOf(startAt))}, ${formatCalendarDate(startAt)} · ${formatClock24(startAt, language)}–${formatClock24(endAt, language)}`
        : '',
    /** "08:00–10:00 (2 giờ)" from HH:mm values. */
    timeRange: (start: string, end: string) => {
      const length = duration(minutesBetween(start, end))
      return length ? `${start}–${end} (${length})` : `${start}–${end}`
    },
    longWeekday,
    relativeDay,
    /** "Thứ Sáu, 06/11/2026" from a calendar date — the full weekday reads better than "T6" in schedules. */
    longDayLabel: (day: string) => `${longWeekday(day)}, ${formatCalendarDate(day)}`,
    /** "14:35 hôm nay" / "14:35 ngày mai" / "14:35 · Thứ Sáu, 06/11/2026" from an instant, relative to `today`. */
    clockWithDay: (value: string | undefined, today: string) => {
      if (!value) return ''
      const day = calendarDayOf(value)
      const relative = relativeDay(day, today)
      const clock = formatClock24(value, language)
      return relative
        ? `${clock} ${relative.toLowerCase()}`
        : `${clock} · ${longWeekday(day)}, ${formatCalendarDate(day)}`
    }
  }
}
