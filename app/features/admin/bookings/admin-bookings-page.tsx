import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { bookingKeys, fetchBookings } from '~/entities/booking/booking-api'
import { BOOKING_STATUSES, bookingErrorKey, formatDate, formatMoney } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingStatus, ListBookingsParams } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

const PAGE_SIZE = 20

function parseStatus(value: string | null): BookingStatus | undefined {
  return BOOKING_STATUSES.find((status) => status === value)
}

/** M-13: every booking on the platform, backend-paginated; the admin opens one to intervene (M-11). */
export function AdminBookingsPage() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('admin.bookingsPage.title'))
  const [params, setParams] = useSearchParams()
  const status = parseStatus(params.get('status'))
  const keyword = params.get('q') ?? ''
  const page = Math.max(Number(params.get('page') ?? '0') || 0, 0)
  const [draft, setDraft] = useState(keyword)
  const query: ListBookingsParams = {
    status,
    keyword: keyword || undefined,
    sort: 'createdAt,desc',
    page,
    size: PAGE_SIZE
  }
  const bookings = useQuery({
    queryKey: bookingKeys.list(query),
    queryFn: () => fetchBookings(query),
    placeholderData: keepPreviousData,
    retry: false
  })

  function update(next: Record<string, string | undefined>) {
    const search = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value)
      else search.delete(key)
    }
    setParams(search, { replace: true })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    update({ q: draft.trim() || undefined, page: undefined })
  }

  return (
    <div className='flex flex-col gap-4 p-5 lg:p-8'>
      <div>
        <h1 className='text-2xl font-bold'>{t('admin.bookingsPage.title')}</h1>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('admin.bookingsPage.description')}</p>
      </div>
      <form className='flex flex-wrap items-end gap-3' onSubmit={submit}>
        <label className='flex flex-col text-sm font-medium'>
          {t('admin.bookingsPage.search')}
          <input
            className='mt-1 rounded-lg border border-outline-variant px-3 py-2'
            maxLength={50}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('admin.bookingsPage.searchPlaceholder')}
            value={draft}
          />
        </label>
        <label className='flex flex-col text-sm font-medium'>
          {t('admin.bookingsPage.status')}
          <select
            className='mt-1 rounded-lg border border-outline-variant px-3 py-2'
            onChange={(event) => update({ status: event.target.value || undefined, page: undefined })}
            value={status ?? ''}
          >
            <option value=''>{t('admin.bookingsPage.allStatuses')}</option>
            {BOOKING_STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`booking.status.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary' type='submit'>
          {t('admin.bookingsPage.apply')}
        </button>
      </form>
      {bookings.isPending ? (
        <SkeletonBlock label={t('admin.bookingsPage.loading')} rows={5} />
      ) : bookings.isError ? (
        <ErrorState
          message={t(bookingErrorKey(bookings.error))}
          onRetry={() => void bookings.refetch()}
          retryLabel={t('admin.bookingsPage.retry')}
        />
      ) : bookings.data.items.length === 0 ? (
        <EmptyState icon='calendar_month' title={t('admin.bookingsPage.empty')} />
      ) : (
        <>
          <p className='text-sm text-on-surface-variant'>
            {t('admin.bookingsPage.total', { count: bookings.data.totalElements })}
          </p>
          <ul className='flex flex-col gap-2'>
            {bookings.data.items.map((booking) => (
              <li key={booking.id}>
                <Link
                  className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/60 bg-white p-4 text-sm hover:border-primary'
                  to={`/admin/bookings/${booking.id}`}
                >
                  <span className='min-w-0'>
                    <span className='block font-semibold'>
                      #{booking.bookingCode} · {booking.recipientName ?? t('admin.bookingsPage.noRecipient')}
                    </span>
                    <span className='block text-xs text-on-surface-variant'>
                      {booking.customer?.fullName ?? t('admin.bookingsPage.unknown')} ·{' '}
                      {t('admin.bookingsPage.startsOn', { date: formatDate(booking.startDate, i18n.language) })}
                    </span>
                  </span>
                  <span className='flex items-center gap-3'>
                    <span className='tabular-nums'>{formatMoney(booking.totalAmount, i18n.language)}</span>
                    <BookingStatusBadge status={booking.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            ariaLabel={t('admin.bookingsPage.pagination')}
            onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
            page={bookings.data.page}
            totalPages={bookings.data.totalPages}
          />
        </>
      )}
    </div>
  )
}
