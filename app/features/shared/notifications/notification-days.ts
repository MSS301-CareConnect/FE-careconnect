import type { NotificationRecord } from '~/shared/api/generated/contracts'
import { dateLocale } from '~/shared/lib/format'

export type NotificationDay = 'today' | 'yesterday' | 'earlier'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

// Calendar day of an instant in the browser's time zone, as a sortable number.
function dayNumber(value: number) {
  const date = new Date(value)
  return Math.floor((value - date.getTimezoneOffset() * MINUTE_MS) / DAY_MS)
}

/** Splits newest-first notifications into today, yesterday and earlier, keeping their order; empty groups are dropped. */
export function groupByDay(items: NotificationRecord[], now: number) {
  const today = dayNumber(now)
  const groups: { day: NotificationDay; items: NotificationRecord[] }[] = []
  for (const item of items) {
    const created = item.createdAt ? dayNumber(new Date(item.createdAt).getTime()) : today - 2
    const day: NotificationDay = created >= today ? 'today' : created === today - 1 ? 'yesterday' : 'earlier'
    const last = groups.at(-1)
    if (last?.day === day) last.items.push(item)
    else groups.push({ day, items: [item] })
  }
  return groups
}

/**
 * Short time of a notification: minutes or hours ago within a day ("5 phút trước"), otherwise the date and time.
 * Null under a minute, so the caller can say "just now".
 */
export function relativeTime(value: string, now: number, language: string) {
  const elapsed = now - new Date(value).getTime()
  if (Number.isNaN(elapsed)) return ''
  if (elapsed < MINUTE_MS) return null
  const format = new Intl.RelativeTimeFormat(dateLocale(language), { numeric: 'auto' })
  if (elapsed < HOUR_MS) return format.format(-Math.floor(elapsed / MINUTE_MS), 'minute')
  if (elapsed < DAY_MS) return format.format(-Math.floor(elapsed / HOUR_MS), 'hour')
  const date = new Date(value)
  const day = new Intl.DateTimeFormat(dateLocale(language), { day: '2-digit', month: '2-digit' }).format(date)
  const time = new Intl.DateTimeFormat(dateLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(date)
  return `${day.replaceAll('-', '/')} · ${time}`
}
