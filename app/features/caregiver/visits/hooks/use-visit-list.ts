import { useSearchParams } from 'react-router'

import type { CaregiverOccurrenceRecord, OccurrenceStatus } from '~/shared/api/generated/contracts'

import {
  ACTIVE_VISIT_STATUSES,
  CANCELLED_VISIT_STATUSES,
  DONE_VISIT_STATUSES,
  useVisitPages
} from '../../data/caregiver-queries'
import { addDays, calendarDayOf, monthEnd, monthStart, weekStart } from '../../ui/caregiver-format'

export const VISIT_TABS = ['respond', 'upcoming', 'inProgress', 'done', 'cancelled'] as const
export type VisitTab = (typeof VISIT_TABS)[number]
export const VISIT_RANGES = ['week', 'month', 'custom'] as const
export type VisitRange = (typeof VISIT_RANGES)[number]

const DAY = /^\d{4}-\d{2}-\d{2}$/

const TAB_STATUSES: Record<VisitTab, ReadonlySet<OccurrenceStatus>> = {
  // "Needs your answer": visits the center assigned and the caregiver has not confirmed yet (customer requests are
  // bookings, listed above them by the page).
  respond: new Set(['SCHEDULED']),
  upcoming: new Set([...ACTIVE_VISIT_STATUSES].filter((status) => status !== 'IN_PROGRESS')),
  inProgress: new Set(['IN_PROGRESS']),
  done: DONE_VISIT_STATUSES,
  cancelled: CANCELLED_VISIT_STATUSES
}

export interface VisitDayGroup {
  day: string
  visits: CaregiverOccurrenceRecord[]
}

export interface VisitBookingGroup {
  bookingId: string
  visits: CaregiverOccurrenceRecord[]
}

/**
 * Visits grouped by booking (2026-11-09), in the order of each booking's first visit in the list; a booking's visits
 * keep the list order (soonest first in the upcoming tabs, newest first in history).
 */
export function groupByBooking(visits: CaregiverOccurrenceRecord[]): VisitBookingGroup[] {
  const groups = new Map<string, VisitBookingGroup>()
  for (const visit of visits) {
    const group = groups.get(visit.bookingId) ?? { bookingId: visit.bookingId, visits: [] }
    group.visits.push(visit)
    groups.set(visit.bookingId, group)
  }
  return [...groups.values()]
}

/** Visits grouped by their calendar day (Vietnam time), in the order given. */
export function groupByDay(visits: CaregiverOccurrenceRecord[]): VisitDayGroup[] {
  const groups: VisitDayGroup[] = []
  for (const visit of visits) {
    const day = calendarDayOf(visit.startAt)
    const last = groups.at(-1)
    if (last?.day === day) last.visits.push(visit)
    else groups.push({ day, visits: [visit] })
  }
  return groups
}

/**
 * Tab, period and custom dates live in the URL. Upcoming and To accept start today; Done and Cancelled read one period
 * (this week, this month or a custom range) and list the newest day first. BookingService takes one status per
 * request, so groups of statuses are filtered on the loaded pages.
 */
export function useVisitList(today: string) {
  const [params, setParams] = useSearchParams()
  // `?tab=toAccept` links from before the merge (2026-11-05) open the same place as "respond".
  const tabParam = params.get('tab') === 'toAccept' ? 'respond' : params.get('tab')
  const tab = VISIT_TABS.find((item) => item === tabParam) ?? 'upcoming'
  const range = VISIT_RANGES.find((item) => item === params.get('range')) ?? 'month'
  const customFrom = DAY.test(params.get('from') ?? '') ? (params.get('from') as string) : addDays(today, -30)
  const customTo = DAY.test(params.get('to') ?? '') ? (params.get('to') as string) : today
  const customInvalid = range === 'custom' && customTo < customFrom
  const history = tab === 'done' || tab === 'cancelled'

  const period =
    range === 'week'
      ? { from: weekStart(today), to: addDays(weekStart(today), 6) }
      : range === 'month'
        ? { from: monthStart(today), to: monthEnd(today) }
        : { from: customFrom, to: customInvalid ? customFrom : customTo }

  const request = history
    ? period
    : tab === 'respond'
      ? { from: today, status: 'SCHEDULED' as const }
      : tab === 'inProgress'
        ? { from: addDays(today, -1), status: 'IN_PROGRESS' as const }
        : { from: today }
  const pages = useVisitPages(request)
  const loaded = pages.data?.pages.flatMap((page) => page.items) ?? []
  const statuses = TAB_STATUSES[tab]
  const visits = loaded.filter((visit) => statuses.has(visit.status))
  if (history) visits.reverse()

  function update(next: Record<string, string>) {
    setParams(
      (previous) => {
        const merged = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(next)) {
          if (value) merged.set(key, value)
          else merged.delete(key)
        }
        return merged
      },
      { replace: true }
    )
  }

  return {
    tab,
    range,
    customFrom,
    customTo,
    customInvalid,
    history,
    pages,
    visits,
    groups: groupByDay(visits),
    bookingGroups: groupByBooking(visits),
    setTab: (value: VisitTab) => update({ tab: value === 'upcoming' ? '' : value }),
    setRange: (value: VisitRange) => update({ range: value === 'month' ? '' : value }),
    setCustom: (from: string, to: string) => update({ range: 'custom', from, to })
  }
}
