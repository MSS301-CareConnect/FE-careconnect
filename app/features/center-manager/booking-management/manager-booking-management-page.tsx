import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey, formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import { BookingStatusBadge } from '~/entities/booking/booking-status-badge'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { ManagerBookingFilters } from './components/manager-booking-filters'
import { useManagerBookings } from './hooks/use-manager-bookings'

const COLUMNS = ['booking', 'customer', 'schedule', 'next', 'total', 'status'] as const

export function ManagerBookingManagementPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const list = useManagerBookings()
  const { bookings } = list
  useDocumentTitle(t('centerManager.bookingManagement.documentTitle'))

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {t('centerManager.bookingManagement.title')}
          </h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>
            {list.pendingCount
              ? t('centerManager.bookingManagement.pendingSubtitle', { count: list.pendingCount })
              : t('centerManager.bookingManagement.subtitle')}
          </p>
        </div>
        {list.pendingCount && list.status !== 'PENDING' ? (
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-container'
            onClick={() => list.setStatus('PENDING')}
            type='button'
          >
            <Icon className='text-lg' name='pending_actions' />
            {t('centerManager.bookingManagement.reviewQueue')}
          </button>
        ) : null}
      </header>

      <ManagerBookingFilters key={`${list.keyword}|${list.from}|${list.to}`} list={list} />

      {bookings.isPending ? (
        <p className='rounded-xl bg-white p-6 text-sm text-on-surface-variant shadow-sm' role='status'>
          {t('centerManager.bookingManagement.loading')}
        </p>
      ) : null}
      {bookings.isError ? (
        <div className='rounded-xl bg-white p-6 shadow-sm' role='alert'>
          <p className='text-sm text-error'>{t(bookingErrorKey(bookings.error))}</p>
          <button
            className='mt-2 text-sm font-semibold text-primary underline'
            onClick={() => void bookings.refetch()}
            type='button'
          >
            {t('booking.actions.retry')}
          </button>
        </div>
      ) : null}
      {bookings.isSuccess && bookings.data.items.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-12 text-center shadow-sm'>
          <Icon className='text-4xl text-primary' name='event_busy' />
          <h2 className='text-lg font-bold'>{t('centerManager.bookingManagement.empty')}</h2>
          {list.hasFilters ? (
            <button className='text-sm font-semibold text-primary underline' onClick={list.reset} type='button'>
              {t('centerManager.bookingManagement.filters.reset')}
            </button>
          ) : null}
        </div>
      ) : null}
      {bookings.isSuccess && bookings.data.items.length > 0 ? (
        <div className='overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white shadow-sm'>
          <table className='w-full min-w-[880px] text-left text-sm'>
            <caption className='sr-only'>{t('centerManager.bookingManagement.title')}</caption>
            <thead className='sticky top-0 z-10 border-b border-outline-variant/25 bg-surface-container-low text-xs uppercase tracking-wider text-on-surface-variant'>
              <tr>
                {COLUMNS.map((column) => (
                  <th className='px-4 py-3.5 font-semibold' key={column} scope='col'>
                    {t(`centerManager.bookingManagement.columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/15'>
              {bookings.data.items.map((booking) => (
                <tr className='transition-colors hover:bg-surface-container-low/50' key={booking.id}>
                  <td className='px-4 py-3.5'>
                    <Link
                      className='font-semibold text-primary hover:underline tabular-nums'
                      to={`/center-manager/bookings/${booking.id}`}
                    >
                      #{booking.bookingCode}
                    </Link>
                    <p className='text-xs text-on-surface-variant'>{booking.recipientName}</p>
                  </td>
                  <td className='px-4 py-3.5'>
                    <p className='font-semibold text-on-surface'>{booking.customer?.fullName ?? '—'}</p>
                    <p className='text-xs text-on-surface-variant tabular-nums'>{booking.customer?.phoneNumber}</p>
                  </td>
                  <td className='px-4 py-3.5 tabular-nums'>
                    <p>
                      {formatDay(booking.startDate, language)}
                      {booking.endDate && booking.endDate !== booking.startDate
                        ? ` – ${formatDay(booking.endDate, language)}`
                        : ''}
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      {t(`booking.scheduleType.${booking.scheduleType}`)} · {shortTime(booking.startTime)}–
                      {shortTime(booking.endTime)}
                    </p>
                  </td>
                  <td className='px-4 py-3.5 tabular-nums'>
                    {booking.nextOccurrenceAt ? formatDateTime(booking.nextOccurrenceAt, language) : '—'}
                    <p className='text-xs text-on-surface-variant'>
                      {t('centerManager.bookingManagement.progress', {
                        done: booking.completedCount ?? 0,
                        total: booking.totalCount ?? 0
                      })}
                    </p>
                  </td>
                  <td className='px-4 py-3.5 font-semibold text-on-surface tabular-nums'>
                    {formatMoney(booking.totalAmount, language)}
                  </td>
                  <td className='px-4 py-3.5'>
                    <BookingStatusBadge status={booking.status} />
                    {booking.caregiverId ? null : (
                      <p className='mt-1 text-xs font-medium text-on-warning-container'>
                        {t('centerManager.bookingManagement.noCaregiver')}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {bookings.isSuccess && bookings.data.totalPages > 1 ? (
        <nav
          aria-label={t('centerManager.bookingManagement.pagination.label')}
          className='flex items-center justify-between rounded-xl border border-outline-variant/20 bg-white p-3 text-sm shadow-sm'
        >
          <button
            className='rounded-lg px-3 py-2 font-semibold text-primary disabled:text-outline'
            disabled={bookings.data.page <= 0}
            onClick={() => list.setPage(bookings.data.page - 1)}
            type='button'
          >
            {t('centerManager.bookingManagement.pagination.previous')}
          </button>
          <span className='text-on-surface-variant tabular-nums'>
            {t('centerManager.bookingManagement.pagination.pageOf', {
              page: bookings.data.page + 1,
              total: bookings.data.totalPages
            })}
          </span>
          <button
            className='rounded-lg px-3 py-2 font-semibold text-primary disabled:text-outline'
            disabled={bookings.data.page + 1 >= bookings.data.totalPages}
            onClick={() => list.setPage(bookings.data.page + 1)}
            type='button'
          >
            {t('centerManager.bookingManagement.pagination.next')}
          </button>
        </nav>
      ) : null}
    </div>
  )
}
