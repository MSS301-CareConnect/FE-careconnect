import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingErrorKey, formatClock } from '~/entities/booking/booking-format'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { PageHeader } from '~/shared/ui/page-header'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { tabId, tabPanelId } from '~/shared/ui/tabs'

import { ManagerBookingQuickAction, type ManagerBookingAction } from './components/manager-booking-action-dialog'
import { BOOKING_LIST_TABS, ManagerBookingFilters } from './components/manager-booking-filters'
import { ManagerBookingQueue } from './components/manager-booking-queue'
import { ManagerBookingTable } from './components/manager-booking-table'
import { useManagerBookings } from './hooks/use-manager-bookings'

/**
 * The center's booking work queue: queue cards, group tabs, a toolbar, then the bookings with their running deadline
 * and the center's answer (confirm, assign, reject) right on the row. The list and counts refresh every 30 seconds.
 */
export function ManagerBookingManagementPage() {
  const { t, i18n } = useTranslation()
  const key = 'centerManager.bookingManagement' as const
  const list = useManagerBookings()
  const { bookings } = list
  const now = useClock(30_000)
  const [quick, setQuick] = useState<{ id: string; action: ManagerBookingAction } | null>(null)
  useDocumentTitle(t(`${key}.documentTitle`))
  const actionCount = list.groupCount('action')

  return (
    <div className='mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'>
      <PageHeader
        actions={
          <Button
            leftIcon={<Icon className='text-lg' name='refresh' />}
            loading={bookings.isFetching}
            onClick={() => {
              void bookings.refetch()
              void list.counts.refetch()
            }}
            variant='outline'
          >
            {t(`${key}.refresh`)}
          </Button>
        }
        description={actionCount ? t(`${key}.pendingSubtitle`, { count: actionCount }) : t(`${key}.subtitle`)}
        meta={
          bookings.dataUpdatedAt ? (
            <span className='inline-flex items-center gap-1.5 text-xs'>
              <Icon className='text-sm' name='autorenew' />
              {t(`${key}.updatedAt`, {
                time: formatClock(new Date(bookings.dataUpdatedAt).toISOString(), i18n.language)
              })}
            </span>
          ) : null
        }
        title={t(`${key}.title`)}
      />

      <ManagerBookingQueue list={list} />
      <ManagerBookingFilters key={list.keyword} list={list} total={bookings.data?.totalElements} />

      <div aria-labelledby={tabId(BOOKING_LIST_TABS, list.group)} id={tabPanelId(BOOKING_LIST_TABS)} role='tabpanel'>
        {bookings.isPending ? <SkeletonBlock label={t(`${key}.loading`)} rows={5} /> : null}
        {bookings.isError ? (
          <ErrorState
            message={t(bookingErrorKey(bookings.error))}
            onRetry={() => void bookings.refetch()}
            retryLabel={t('booking.actions.retry')}
          />
        ) : null}
        {bookings.isSuccess && bookings.data.items.length === 0 ? (
          <EmptyState
            action={
              list.hasFilters ? (
                <Button onClick={list.reset} size='sm' variant='secondary'>
                  {t(`${key}.filters.reset`)}
                </Button>
              ) : undefined
            }
            description={list.group === 'action' && !list.hasFilters ? t(`${key}.emptyGroup.actionHint`) : undefined}
            icon={list.group === 'action' ? 'task_alt' : 'event_busy'}
            title={list.hasFilters ? t(`${key}.empty`) : t(`${key}.emptyGroup.${list.group}`)}
          />
        ) : null}
        {bookings.isSuccess && bookings.data.items.length > 0 ? (
          <ManagerBookingTable
            bookings={bookings.data.items}
            now={now}
            onAction={(booking: BookingSummaryRecord, action) => setQuick({ id: booking.id, action })}
          />
        ) : null}
      </div>

      {bookings.isSuccess && bookings.data.totalPages > 1 ? (
        <Pagination
          ariaLabel={t(`${key}.pagination.label`)}
          nextLabel={t(`${key}.pagination.next`)}
          onPageChange={list.setPage}
          page={bookings.data.page}
          pageOfLabel={t(`${key}.pagination.pageOf`, {
            page: bookings.data.page + 1,
            total: bookings.data.totalPages
          })}
          previousLabel={t(`${key}.pagination.previous`)}
          totalPages={bookings.data.totalPages}
        />
      ) : null}

      {quick ? (
        <ManagerBookingQuickAction action={quick.action} bookingId={quick.id} onClose={() => setQuick(null)} />
      ) : null}
    </div>
  )
}
