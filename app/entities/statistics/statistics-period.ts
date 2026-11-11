import { useSearchParams } from 'react-router'

import { APP_TIME_ZONE } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'

export const INSIGHT_PERIODS = ['month', 'last30', 'year'] as const
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
const calendarDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

/**
 * One period for every number of a dashboard (2026-11-10): it ends now; a month or a year starts at the first Vietnam
 * calendar day. Callers pass a mounted clock (`useClock`) so query keys stay stable between renders.
 */
export function insightRange(period: InsightPeriod, now: Date): InsightRange {
  const today = calendarDay.format(now)
  const [year, month] = today.split('-')
  const fromDate =
    period === 'month'
      ? `${year}-${month}-01`
      : period === 'year'
        ? `${year}-01-01`
        : calendarDay.format(new Date(now.getTime() - 29 * DAY))
  // Midnight in Vietnam (UTC+7, no daylight saving) of the first day.
  const from = new Date(`${fromDate}T00:00:00+07:00`).toISOString()
  return {
    period,
    fromDate,
    toDate: today,
    from,
    to: now.toISOString(),
    groupBy: period === 'year' ? 'MONTH' : 'DAY'
  }
}

/** The dashboard period lives in `?period=` so a shared link keeps it; anything unknown is "this month". */
export function useInsightPeriod() {
  const [params, setParams] = useSearchParams()
  const period = INSIGHT_PERIODS.find((item) => item === params.get('period')) ?? 'month'
  // Mounted "now", refreshed every five minutes: query keys stay stable between renders.
  const now = useClock(5 * 60_000)
  const range = insightRange(period, new Date(now))

  function choose(next: InsightPeriod) {
    setParams(
      (previous) => {
        const updated = new URLSearchParams(previous)
        if (next === 'month') updated.delete('period')
        else updated.set('period', next)
        return updated
      },
      { replace: true }
    )
  }

  return { period, range, choose }
}
