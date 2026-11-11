import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingStatusCounts, fetchBookings } from '~/entities/booking/booking-api'
import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import type { BookingStatus, BookingStatusCountRecord, ListBookingsParams } from '~/shared/api/generated/contracts'
import { pageSizeOf } from '~/shared/ui/pagination'

const PAGE_SIZE = 10
const DATE = /^\d{4}-\d{2}-\d{2}$/
// The queue moves on its own (new requests, the expiry job), so the screen refreshes while it is open.
export const REFRESH_MS = 30_000

/** Work queue first: what the center must do, what waits on someone else, running care, closed bookings, all. */
export const MANAGER_GROUPS = ['action', 'waiting', 'active', 'closed', 'all'] as const
export type ManagerGroup = (typeof MANAGER_GROUPS)[number]

export const GROUP_STATUSES: Record<ManagerGroup, readonly BookingStatus[]> = {
  action: ['PENDING_CENTER_CONFIRMATION', 'PENDING_CAREGIVER_ASSIGNMENT'],
  waiting: ['PENDING_CAREGIVER_CONFIRMATION', 'AWAITING_INITIAL_PAYMENT'],
  active: ['CONFIRMED', 'IN_PROGRESS'],
  closed: ['COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  all: []
}

export const MANAGER_SORTS = ['deadlineAt,asc', 'createdAt,desc', 'startDate,asc'] as const
export type ManagerSort = (typeof MANAGER_SORTS)[number]

// Groups with running deadlines sort by the nearest one; the others by the newest request.
function defaultSort(group: ManagerGroup): ManagerSort {
  return group === 'action' || group === 'waiting' ? 'deadlineAt,asc' : 'createdAt,desc'
}

function groupOf(status: BookingStatus | undefined): ManagerGroup | undefined {
  if (!status) return undefined
  return MANAGER_GROUPS.find((group) => GROUP_STATUSES[group].includes(status))
}

/**
 * Filters live in the URL (`group`, `status` inside it, `q`, `from`, `to`, `sort`, `page`, `size`). An old link with only
 * `status` opens that status' group. BookingService scopes the list and the counts to the manager's center.
 */
export function useManagerBookings() {
  const [params, setParams] = useSearchParams()
  const status = BOOKING_STATUSES.find((item) => item === params.get('status'))
  const group = MANAGER_GROUPS.find((item) => item === params.get('group')) ?? groupOf(status) ?? 'action'
  const keyword = params.get('q') ?? ''
  const from = DATE.test(params.get('from') ?? '') ? (params.get('from') ?? undefined) : undefined
  const to = DATE.test(params.get('to') ?? '') ? (params.get('to') ?? undefined) : undefined
  const sort = MANAGER_SORTS.find((item) => item === params.get('sort')) ?? defaultSort(group)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const size = pageSizeOf(params.get('size'), PAGE_SIZE)
  const statuses = status && GROUP_STATUSES[group].includes(status) ? [status] : [...GROUP_STATUSES[group]]
  const request: ListBookingsParams = {
    statuses: statuses.length ? statuses : undefined,
    keyword: keyword.trim() || undefined,
    from,
    to,
    sort,
    page,
    size
  }

  const bookings = useQuery({
    queryKey: bookingKeys.list(request),
    queryFn: () => fetchBookings(request),
    // Keep the rows on screen while another filter loads instead of flashing a skeleton.
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
    retry: false
  })
  const counts = useQuery({
    queryKey: bookingKeys.statusCounts(),
    queryFn: () => fetchBookingStatusCounts(),
    refetchInterval: REFRESH_MS,
    retry: false
  })
  const byStatus = new Map<BookingStatus, BookingStatusCountRecord>(
    (counts.data?.statuses ?? []).map((item) => [item.status, item])
  )
  const countOf = (items: readonly BookingStatus[]) =>
    counts.data ? items.reduce((sum, item) => sum + (byStatus.get(item)?.count ?? 0), 0) : undefined

  function update(
    values: Partial<Record<'group' | 'status' | 'q' | 'from' | 'to' | 'sort' | 'page' | 'size', string>>
  ) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(values)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in values)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  return {
    bookings,
    counts,
    byStatus,
    groupCount: (value: ManagerGroup) => countOf(value === 'all' ? BOOKING_STATUSES : GROUP_STATUSES[value]),
    group,
    status,
    keyword,
    from,
    to,
    sort,
    size,
    hasFilters: Boolean(status || request.keyword || from || to),
    setGroup: (value: ManagerGroup) => update({ group: value, status: '', sort: '' }),
    /** Opens a status inside its group (the queue cards); an empty value shows the whole group. */
    setStatus: (value: BookingStatus | '') => update({ group: groupOf(value || undefined) ?? group, status: value }),
    setKeyword: (value: string) => update({ q: value.trim() }),
    setRange: (nextFrom: string, nextTo: string) => update({ from: nextFrom, to: nextTo }),
    setSort: (value: ManagerSort) => update({ sort: value === defaultSort(group) ? '' : value }),
    setPage: (value: number) => update({ page: value > 0 ? String(value) : '' }),
    setSize: (value: number) => update({ size: value === PAGE_SIZE ? '' : String(value) }),
    reset: () => update({ status: '', q: '', from: '', to: '' })
  }
}

export type ManagerBookingList = ReturnType<typeof useManagerBookings>
