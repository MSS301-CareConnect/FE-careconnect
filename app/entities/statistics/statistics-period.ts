import { useSearchParams } from 'react-router'

import { APP_TIME_ZONE } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'

export const INSIGHT_PERIODS = ['month', 'last30', 'year', 'custom'] as const
export type InsightPeriod = (typeof INSIGHT_PERIODS)[number]

export interface InsightRange {
  period: InsightPeriod
  /** Vietnam calendar days for BookingService (`from` / `to` are inclusive LocalDate). */
  fromDate: string
  toDate: string
  /** Instants for PaymentService (revenue, wallet). */
  from: string
  to: string
  groupBy: 'DAY' | 'MONTH'
}

const DAY = 24 * 60 * 60 * 1000
const DATE = /^\d{4}-\d{2}-\d{2}$/
// A custom range longer than about two months is charted per month, like "this year".
const MONTHLY_FROM_DAYS = 62
const calendarDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

// Midnight in Vietnam (UTC+7, no daylight saving) of a calendar day.
function startOfDay(day: string) {
  return new Date(`${day}T00:00:00+07:00`)
}

/**
 * One period for every number of a dashboard (2026-11-10): it ends now; a month or a year starts at the first Vietnam
 * calendar day. `custom` (2026-11-11) is the inclusive calendar range the user picked; without a valid range it reads
 * as "this month". Callers pass a mounted clock (`useClock`) so query keys stay stable between renders.
 */
export function insightRange(period: InsightPeriod, now: Date, custom?: { from?: string; to?: string }): InsightRange {
  const today = calendarDay.format(now)
  if (period === 'custom' && custom?.from && custom.to && custom.from <= custom.to) {
    const end = Math.min(startOfDay(custom.to).getTime() + DAY, now.getTime())
    const days = (startOfDay(custom.to).getTime() - startOfDay(custom.from).getTime()) / DAY + 1
    return {
      period,
      fromDate: custom.from,
      toDate: custom.to,
      from: startOfDay(custom.from).toISOString(),
      // PaymentService wants from < to: a range entirely in the future still gets a one-day window.
      to: new Date(Math.max(end, startOfDay(custom.from).getTime() + DAY)).toISOString(),
      groupBy: days > MONTHLY_FROM_DAYS ? 'MONTH' : 'DAY'
    }
  }
  const [year, month] = today.split('-')
  const fromDate =
    period === 'year'
      ? `${year}-01-01`
      : period === 'last30'
        ? calendarDay.format(new Date(now.getTime() - 29 * DAY))
        : `${year}-${month}-01`
  return {
    period,
    fromDate,
    toDate: today,
    from: startOfDay(fromDate).toISOString(),
    to: now.toISOString(),
    groupBy: period === 'year' ? 'MONTH' : 'DAY'
  }
}

/**
 * The dashboard period lives in `?period=` (plus `?from=&to=` for a custom range) so a shared link keeps it; anything
 * unknown is "this month".
 */
export function useInsightPeriod() {
  const [params, setParams] = useSearchParams()
  const period = INSIGHT_PERIODS.find((item) => item === params.get('period')) ?? 'month'
  // Mounted "now", refreshed every five minutes: query keys stay stable between renders.
  const now = useClock(5 * 60_000)
  const custom = {
    from: DATE.test(params.get('from') ?? '') ? (params.get('from') ?? '') : '',
    to: DATE.test(params.get('to') ?? '') ? (params.get('to') ?? '') : ''
  }
  const range = insightRange(period, new Date(now), custom)

  function update(values: Record<string, string>) {
    setParams(
      (previous) => {
        const updated = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(values)) {
          if (value) updated.set(name, value)
          else updated.delete(name)
        }
        return updated
      },
      { replace: true }
    )
  }

  function choose(next: InsightPeriod) {
    // "Custom" starts from the dates on screen, so picking it never changes the numbers by surprise.
    if (next === 'custom')
      update({ period: 'custom', from: custom.from || range.fromDate, to: custom.to || range.toDate })
    else update({ period: next === 'month' ? '' : next, from: '', to: '' })
  }

  return {
    period,
    range,
    choose,
    custom,
    customInvalid: period === 'custom' && Boolean(custom.from && custom.to && custom.to < custom.from),
    setCustom: (from: string, to: string) => update({ period: 'custom', from, to })
  }
}

export type InsightPeriodState = ReturnType<typeof useInsightPeriod>
