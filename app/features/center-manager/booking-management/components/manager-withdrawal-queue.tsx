import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchCaregiverWithdrawals } from '~/entities/booking/booking-api'
import type { CaregiverWithdrawalRecord, ListCaregiverWithdrawalsParams } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { useCenterCaregivers } from '../hooks/use-center-caregivers'

const VISIBLE = 5
const key = 'centerManager.withdrawals' as const

/** Pending withdrawals of the center (or of one booking), soonest visit first; refreshed with the booking queue. */
export function useCenterWithdrawals(bookingId?: string) {
  const params: ListCaregiverWithdrawalsParams = { pendingOnly: true, bookingId, page: 0, size: 50 }
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
    <li className='flex flex-col gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='min-w-0 text-sm'>
        <p className='font-semibold text-on-surface tabular-nums'>
          {t(`${key}.visit`, { number: item.occurrenceNo ?? '', time })}
        </p>
        <p className='text-on-surface-variant'>
          <span className='font-mono'>{item.bookingCode}</span>
          {item.recipientName ? ` · ${item.recipientName}` : ''}
        </p>
        <p className='text-xs text-on-surface-variant'>
          {t(`${key}.caregiver`, { name: caregiverName })} · {t(`${key}.reason`, { reason })}
        </p>
      </div>
      <Link
        className='inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        to={`/center-manager/bookings/${item.bookingId}`}
      >
        <Icon className='text-lg' name='person_search' />
        {t(`${key}.assign`)}
      </Link>
    </li>
  )
}

/**
 * Visits caregivers withdrew from that still need someone else (2026-11-09). The system keeps trying to assign a free
 * caregiver; the manager can assign one right away from the booking page. Hidden when nothing waits.
 */
export function ManagerWithdrawalQueue() {
  const { t } = useTranslation()
  const withdrawals = useCenterWithdrawals()
  const { nameOf } = useCenterCaregivers()
  const items = withdrawals.data?.items ?? []
  if (!withdrawals.isSuccess || items.length === 0) return null

  return (
    <section
      aria-labelledby='manager-withdrawals-title'
      className='rounded-2xl border border-caution/40 bg-caution-container/30 p-4 sm:p-5'
    >
      <h2 className='flex items-center gap-2 text-base font-semibold text-on-surface' id='manager-withdrawals-title'>
        <Icon className='text-xl text-caution' name='person_alert' />
        {t(`${key}.title`, { count: withdrawals.data.totalElements })}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {items.slice(0, VISIBLE).map((item) => (
          <WithdrawalRow
            caregiverName={(item.caregiverId && nameOf(item.caregiverId)) || t(`${key}.unknownCaregiver`)}
            item={item}
            key={item.id}
          />
        ))}
      </ul>
      {withdrawals.data.totalElements > VISIBLE ? (
        <p className='mt-2 text-xs text-on-surface-variant'>
          {t(`${key}.more`, { count: withdrawals.data.totalElements - VISIBLE })}
        </p>
      ) : null}
    </section>
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
