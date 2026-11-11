import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchCaregiverWithdrawals } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingGroupCard, groupByBooking } from '~/entities/booking/booking-group-card'
import type { CaregiverWithdrawalRecord, ListCaregiverWithdrawalsParams } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { useCenterCaregivers } from '../hooks/use-center-caregivers'

const key = 'centerManager.withdrawals' as const

/** Pending withdrawals of the center (or of one booking), soonest visit first; refreshed with the booking queue. */
export function useCenterWithdrawals(bookingId?: string, page = 0, size = 50) {
  const params: ListCaregiverWithdrawalsParams = { pendingOnly: true, bookingId, page, size }
  return useQuery({
    queryKey: bookingKeys.withdrawals(params),
    queryFn: () => fetchCaregiverWithdrawals(params),
    refetchInterval: 30_000,
    retry: false
  })
}

function WithdrawalRow({ item, caregiverName }: { item: CaregiverWithdrawalRecord; caregiverName: string }) {
  const { t } = useTranslation()
  const format = useFormat()
  const time = `${format.longDayLabel(calendarDayOf(item.startAt))} · ${t('bookingSchedule.timeRange', {
    start: format.clock(item.startAt),
    end: format.clock(item.endAt)
  })}`
  const reason =
    item.reasonCode === 'OTHER' && item.reasonDetail
      ? item.reasonDetail
      : `${t(`${key}.reasons.${item.reasonCode}`)}${item.reasonDetail ? ` — ${item.reasonDetail}` : ''}`
  return (
    <li className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3 text-sm'>
      <p className='font-semibold text-on-surface tabular-nums'>
        {t(`${key}.visit`, { number: item.occurrenceNo ?? '', time })}
      </p>
      <p className='text-xs text-on-surface-variant'>
        {t(`${key}.caregiver`, { name: caregiverName })} · {t(`${key}.reason`, { reason })}
      </p>
    </li>
  )
}

/**
 * Visits caregivers withdrew from that still need someone else (2026-11-09). The system keeps trying to assign a free
 * caregiver; the manager can assign one right away from the booking page. Shown in the bookings page's attention popup
 * (2026-11-11), paged by BookingService.
 */
export function ManagerWithdrawalQueue() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const withdrawals = useCenterWithdrawals(undefined, page, size)
  const { nameOf } = useCenterCaregivers()
  const items = withdrawals.data?.items ?? []
  if (withdrawals.isPending) return <SkeletonBlock label={t('centerManager.attention.loading')} rows={2} />
  if (withdrawals.isError) {
    return (
      <ErrorState
        message={t(bookingErrorKey(withdrawals.error))}
        onRetry={() => void withdrawals.refetch()}
        retryLabel={t('booking.actions.retry')}
      />
    )
  }
  if (items.length === 0) return <EmptyState icon='task_alt' title={t('centerManager.attention.empty')} />

  return (
    <div>
      <p className='text-sm text-on-surface-variant'>{t(`${key}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {groupByBooking(items).map(({ bookingId, rows }, index) => (
          <BookingGroupCard
            action={
              <Link
                className='inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={`/center-manager/bookings/${bookingId}`}
              >
                <Icon className='text-base' name='person_search' />
                {t(`${key}.assign`)}
              </Link>
            }
            bookingCode={rows[0].bookingCode}
            countLabel={t('booking.group.visits', { count: rows.length })}
            defaultOpen={index === 0}
            key={bookingId}
            recipientName={rows[0].recipientName}
          >
            {rows.map((item) => (
              <WithdrawalRow
                caregiverName={(item.caregiverId && nameOf(item.caregiverId)) || t(`${key}.unknownCaregiver`)}
                item={item}
                key={item.id}
              />
            ))}
          </BookingGroupCard>
        ))}
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
        totalElements={withdrawals.data.totalElements}
        totalPages={Math.ceil(withdrawals.data.totalElements / size)}
      />
    </div>
  )
}

/** On a booking page: how many of its visits a caregiver withdrew from and how to reassign them. */
export function BookingWithdrawalNotice({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const withdrawals = useCenterWithdrawals(bookingId)
  const count = withdrawals.data?.totalElements ?? 0
  if (!count) return null
  return (
    <div className='rounded-2xl border border-caution/40 bg-caution-container/30 p-4' role='status'>
      <p className='flex items-center gap-2 font-semibold text-on-surface'>
        <Icon className='text-xl text-caution' name='person_alert' />
        {t(`${key}.inBooking`, { count })}
      </p>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.inBookingHint`)}</p>
    </div>
  )
}
