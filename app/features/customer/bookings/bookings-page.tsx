import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { PageHeader, pageContainer } from '~/shared/ui/page-header'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { tabId, tabPanelId } from '~/shared/ui/tabs'

import { bookingAction } from './booking-groups'
import { BOOKING_TABS_ID, BookingListToolbar } from './components/booking-list-toolbar'
import { BookingSummaryCard } from './components/booking-summary-card'
import { useCustomerBookings } from './hooks/use-customer-bookings'

const key = 'customer.myBookings' as const
const bookAction =
  'inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function CustomerBookingsPage() {
  const { t } = useTranslation()
  const list = useCustomerBookings()
  const { collection } = list
  useDocumentTitle(t(`${key}.documentTitle`))
  const nothingYet = collection.isSuccess && collection.data.items.length === 0

  return (
    <div className={`${pageContainer} pb-16`}>
      <PageHeader description={t(`${key}.subtitle`)} title={t(`${key}.title`)} />

      {nothingYet ? null : <BookingListToolbar list={list} />}

      <section
        aria-labelledby={nothingYet ? undefined : tabId(BOOKING_TABS_ID, list.group)}
        className='mt-5 flex flex-col gap-4'
        id={tabPanelId(BOOKING_TABS_ID)}
        role={nothingYet ? undefined : 'tabpanel'}
      >
        {collection.isPending ? (
          <SkeletonGroup className='flex flex-col gap-4' label={t(`${key}.states.loading`)}>
            {[0, 1, 2].map((index) => (
              <div className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5' key={index}>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-11 w-11 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-1/3 rounded' />
                    <Skeleton className='h-4 w-1/4 rounded' />
                  </div>
                  <Skeleton className='h-6 w-28 rounded-full' />
                </div>
                <Skeleton className='mt-5 h-14 w-full rounded-xl' />
              </div>
            ))}
          </SkeletonGroup>
        ) : null}

        {collection.isError ? (
          <ErrorState
            message={t(bookingErrorKey(collection.error))}
            onRetry={() => void collection.refetch()}
            retryLabel={t('booking.actions.retry')}
          />
        ) : null}

        {nothingYet ? (
          <EmptyState
            action={
              <Link className={bookAction} to='/customer/booking'>
                <Icon className='text-lg' name='add' />
                {t(`${key}.book`)}
              </Link>
            }
            description={t(`${key}.empty.description`)}
            icon='event_note'
            title={t(`${key}.empty.title`)}
          />
        ) : null}

        {collection.isSuccess && !nothingYet && list.items.length === 0 ? (
          <EmptyState
            action={
              list.hasFilters ? (
                <Button onClick={list.clearFilters} variant='outline'>
                  {t(`${key}.filters.reset`)}
                </Button>
              ) : undefined
            }
            description={list.hasFilters ? t(`${key}.empty.filteredDescription`) : t(`${key}.empty.tab.${list.group}`)}
            icon={list.hasFilters ? 'search_off' : 'event_available'}
            title={list.hasFilters ? t(`${key}.empty.filteredTitle`) : t(`${key}.empty.tabTitle`)}
          />
        ) : null}

        {list.items.length > 0 ? (
          <>
            <p aria-live='polite' className='text-sm text-on-surface-variant tabular-nums'>
              {t(`${key}.count`, { count: list.matchingCount })}
            </p>
            <div className='cc-stagger flex flex-col gap-4'>
              {list.items.map((booking) => (
                <BookingSummaryCard
                  action={bookingAction(booking, list.openInvoiceBookings)}
                  booking={booking}
                  key={booking.id}
                />
              ))}
            </div>
            <Pagination
              ariaLabel={t(`${key}.pagination.label`)}
              onPageChange={list.setPage}
              page={list.page}
              totalPages={list.totalPages}
            />
            {collection.data?.truncated ? (
              <p className='text-xs text-on-surface-variant'>
                {t(`${key}.truncated`, { count: collection.data.items.length })}
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  )
}
