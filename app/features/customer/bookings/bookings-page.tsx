import { useTranslation } from 'react-i18next'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { BookingListToolbar } from './components/booking-list-toolbar'
import { BookingSummaryCard } from './components/booking-summary-card'
import { useCustomerBookings } from './hooks/use-customer-bookings'

export function CustomerBookingsPage() {
  const { t, i18n } = useTranslation()
  const list = useCustomerBookings()
  const { bookings } = list
  useDocumentTitle(t('customer.myBookings.documentTitle'))

  return (
    <div className='min-h-full bg-surface pb-16'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
        <div className='flex flex-col justify-between gap-5 md:flex-row md:items-end'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {t('customer.myBookings.title')}
            </h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base'>
              {bookings.isSuccess
                ? t('customer.myBookings.subtitleCount', {
                    count: new Intl.NumberFormat(i18n.language).format(bookings.data.totalElements)
                  })
                : t('customer.myBookings.subtitle')}
            </p>
          </div>
        </div>

        <BookingListToolbar key={list.keyword} list={list} />

        {bookings.isPending ? (
          <p className='rounded-xl bg-white p-6 text-sm text-on-surface-variant shadow-sm' role='status'>
            {t('customer.myBookings.states.loading')}
          </p>
        ) : null}
        {bookings.isError ? (
          <div className='flex flex-col items-start gap-2 rounded-xl bg-white p-6 shadow-sm' role='alert'>
            <p className='text-sm text-error'>{t(bookingErrorKey(bookings.error))}</p>
            <button
              className='text-sm font-semibold text-primary underline'
              onClick={() => void bookings.refetch()}
              type='button'
            >
              {t('booking.actions.retry')}
            </button>
          </div>
        ) : null}
        {bookings.isSuccess && bookings.data.items.length === 0 ? (
          <div className='flex flex-col items-center rounded-xl bg-white px-6 py-12 text-center shadow-sm'>
            <span className='grid h-16 w-16 place-items-center rounded-full bg-surface-container text-on-surface-variant'>
              <Icon className='text-3xl' name='event_busy' />
            </span>
            <h2 className='mt-4 text-lg font-bold'>
              {list.hasFilters ? t('customer.myBookings.empty.filteredTitle') : t('customer.myBookings.empty.title')}
            </h2>
            <p className='mt-2 max-w-md text-sm text-on-surface-variant'>
              {list.hasFilters
                ? t('customer.myBookings.empty.filteredDescription')
                : t('customer.myBookings.empty.description')}
            </p>
            {list.hasFilters ? (
              <button
                className='mt-5 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high'
                onClick={list.reset}
                type='button'
              >
                {t('customer.myBookings.filters.reset')}
              </button>
            ) : null}
          </div>
        ) : null}
        {bookings.isSuccess && bookings.data.items.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {bookings.data.items.map((booking) => (
              <BookingSummaryCard booking={booking} key={booking.id} />
            ))}
          </div>
        ) : null}
        {bookings.isSuccess && bookings.data.totalPages > 1 ? (
          <nav
            aria-label={t('customer.myBookings.pagination.label')}
            className='flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm'
          >
            <button
              className='rounded-lg px-3 py-2 font-semibold text-primary disabled:text-outline'
              disabled={bookings.data.page <= 0}
              onClick={() => list.setPage(bookings.data.page - 1)}
              type='button'
            >
              {t('customer.myBookings.pagination.previous')}
            </button>
            <span className='text-on-surface-variant'>
              {t('customer.myBookings.pagination.pageOf', {
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
              {t('customer.myBookings.pagination.next')}
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
