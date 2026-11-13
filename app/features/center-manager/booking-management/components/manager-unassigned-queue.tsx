import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchUnassignedVisits } from '~/entities/booking/booking-api'
import { bookingDay, bookingErrorKey } from '~/entities/booking/booking-format'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

const key = 'centerManager.attention.unassigned' as const
// shortcut: mirrors BookingService booking.schedule.unassigned-cancel-lead (12h); read it from the API if it becomes per center.
const CANCEL_LEAD_MS = 12 * 3_600_000
const link =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/** Paid visits of the center still without a caregiver; one-row reads give the attention card its count. */
export function useUnassignedVisits(page = 0, size = 5) {
  return useQuery({
    queryKey: bookingKeys.unassigned(page, size),
    queryFn: () => fetchUnassignedVisits(page, size),
    refetchInterval: 60_000,
    retry: false
  })
}

/**
 * Paid visits nobody could be assigned to (2026-11-13), earliest first, with when BookingService will cancel and refund
 * them. "Assign" opens the booking; "Open a shift" opens the work-shift form for that day and time, since auto-assign
 * only picks caregivers whose approved shifts cover the visit.
 */
export function ManagerUnassignedQueue() {
  const { t } = useTranslation()
  const format = useFormat()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const visits = useUnassignedVisits(page, size)
  if (visits.isPending) return <SkeletonBlock label={t('centerManager.attention.loading')} rows={2} />
  if (visits.isError) {
    return (
      <ErrorState
        message={t(bookingErrorKey(visits.error))}
        onRetry={() => void visits.refetch()}
        retryLabel={t('booking.actions.retry')}
      />
    )
  }
  const items = visits.data.items
  if (items.length === 0) return <EmptyState icon='task_alt' title={t('centerManager.attention.empty')} />
  const total = visits.data.totalElements

  return (
    <div>
      <p className='text-sm text-on-surface-variant'>{t(`${key}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {items.map((visit) => {
          const shiftQuery = new URLSearchParams({
            new: '1',
            date: bookingDay(new Date(visit.startAt)),
            start: format.clock(visit.startAt),
            end: format.clock(visit.endAt)
          })
          return (
            <li
              className='@container rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3'
              key={visit.id}
            >
              <div className='flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between'>
                <div className='min-w-0 space-y-1 text-sm'>
                  <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface tabular-nums'>
                    {t(`${key}.visit`, {
                      number: visit.occurrenceNo ?? '',
                      time: format.visitRange(visit.startAt, visit.endAt)
                    })}
                    {visit.needsReassignment ? (
                      <StatusBadge tone='warning'>{t(`${key}.replacement`)}</StatusBadge>
                    ) : null}
                  </p>
                  <p className='text-on-surface-variant'>
                    <span className='font-mono'>{visit.bookingCode}</span>
                    {visit.recipientName ? ` · ${visit.recipientName}` : ''}
                  </p>
                  <p className='flex items-center gap-1 text-xs font-medium text-error'>
                    <Icon className='text-sm' name='timer' />
                    {t(`${key}.cancelAt`, {
                      time: format.dateTime(new Date(Date.parse(visit.startAt) - CANCEL_LEAD_MS).toISOString())
                    })}
                  </p>
                </div>
                <div className='flex shrink-0 flex-wrap gap-2'>
                  <Link
                    className={`${link} border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low`}
                    to={`/center-manager/work-shifts?${shiftQuery.toString()}`}
                  >
                    {t(`${key}.openShift`)}
                  </Link>
                  <Link
                    className={`${link} bg-primary text-on-primary hover:bg-primary-container`}
                    to={`/center-manager/bookings/${visit.bookingId}`}
                  >
                    {t(`${key}.assign`)}
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <Pagination
        className='mt-4'
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setSize(next)
          setPage(0)
        }}
        page={page}
        pageSize={size}
        pageSizeOptions={[5, 10, 20]}
        totalElements={total}
        totalPages={Math.ceil(total / size)}
      />
    </div>
  )
}
