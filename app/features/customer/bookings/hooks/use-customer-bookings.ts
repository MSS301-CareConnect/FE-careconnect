import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { bookingKeys, fetchBookingCollection } from '~/entities/booking/booking-api'
import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import { fetchOutstandingDebt, paymentKeys } from '~/entities/payment/payment-api'

import {
  BOOKING_GROUPS,
  BOOKING_SORTS,
  compareBookings,
  inGroup,
  matchesKeyword,
  type BookingGroup,
  type BookingSort
} from '../booking-groups'

export const BOOKINGS_PAGE_SIZE = 10
// Sort values of the previous list, kept so saved links still sort the same way.
const LEGACY_SORTS: Record<string, BookingSort> = {
  'createdAt,desc': 'newest',
  'startDate,asc': 'startSoonest',
  'startDate,desc': 'startLatest'
}

/**
 * The customer's bookings grouped into tabs. BookingService filters one status at a time, so the list reads the
 * customer's bookings once (newest 500) and groups, searches, sorts and pages them here. Tab, keyword, sort and page
 * live in the URL; an older `?status=` link still narrows the list to that exact status.
 */
export function useCustomerBookings() {
  const [params, setParams] = useSearchParams()
  const status = BOOKING_STATUSES.find((item) => item === params.get('status'))
  const group = BOOKING_GROUPS.find((item) => item === params.get('tab')) ?? 'all'
  const keyword = params.get('q') ?? ''
  const rawSort = params.get('sort') ?? ''
  const sort = BOOKING_SORTS.find((item) => item === rawSort) ?? LEGACY_SORTS[rawSort] ?? 'newest'
  const requestedPage = Math.max(0, Number(params.get('page')) || 0)

  const collection = useQuery({
    queryKey: bookingKeys.collection({}),
    queryFn: () => fetchBookingCollection(),
    retry: false
  })
  // Remaining-balance invoices still open put their booking under "Needs action"; a failure only hides that hint.
  const outstanding = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })
  const openInvoiceBookings = useMemo(
    () =>
      new Set(
        [...(outstanding.data?.overdueInvoices ?? []), ...(outstanding.data?.pendingInvoices ?? [])].map(
          (invoice) => invoice.bookingId
        )
      ),
    [outstanding.data]
  )

  const all = useMemo(() => collection.data?.items ?? [], [collection.data])
  const counts = useMemo(() => {
    const result = {} as Record<BookingGroup, number>
    for (const item of BOOKING_GROUPS)
      result[item] = all.filter((booking) => inGroup(booking, item, openInvoiceBookings)).length
    return result
  }, [all, openInvoiceBookings])
  const matching = useMemo(
    () =>
      all
        .filter((booking) => (status ? booking.status === status : inGroup(booking, group, openInvoiceBookings)))
        .filter((booking) => matchesKeyword(booking, keyword))
        .sort(compareBookings(sort)),
    [all, status, group, openInvoiceBookings, keyword, sort]
  )
  const totalPages = Math.ceil(matching.length / BOOKINGS_PAGE_SIZE)
  const page = Math.min(requestedPage, Math.max(0, totalPages - 1))
  const items = matching.slice(page * BOOKINGS_PAGE_SIZE, (page + 1) * BOOKINGS_PAGE_SIZE)

  function update(changes: Partial<Record<'tab' | 'status' | 'q' | 'sort' | 'page', string>>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in changes)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  return {
    collection,
    openInvoiceBookings,
    counts,
    items,
    matchingCount: matching.length,
    page,
    totalPages,
    group,
    status,
    keyword,
    sort,
    /** A search or an exact status narrows the tab; an empty result then offers to clear them. */
    hasFilters: Boolean(status || keyword.trim()),
    setGroup: (value: BookingGroup) => update({ tab: value === 'all' ? '' : value, status: '' }),
    clearStatus: () => update({ status: '' }),
    setKeyword: (value: string) => update({ q: value.trim() }),
    setSort: (value: BookingSort) => update({ sort: value === 'newest' ? '' : value }),
    setPage: (value: number) => update({ page: value > 0 ? String(value) : '' }),
    clearFilters: () => update({ q: '', status: '' })
  }
}
