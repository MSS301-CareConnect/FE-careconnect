import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchCaregiverAbsences, fetchCaregiverAbsenceStatistics } from '~/entities/booking/booking-api'
import { BookingGroupCard, groupByBooking } from '~/entities/booking/booking-group-card'
import { CaregiverAbsenceCard } from '~/entities/booking/caregiver-absence-card'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { StatusBadge } from '~/shared/ui/status-badge'

const key = 'caregiverAbsence.profile' as const
const STATS = [
  ['total', 'text-on-surface'],
  ['pending', 'text-peach-700'],
  ['excused', 'text-on-surface-variant'],
  ['confirmed', 'text-error']
] as const

/**
 * Missed visits of one caregiver (2026-11-10): counts by conclusion and the records, paged by BookingService and
 * folded per booking (2026-11-11). How many still wait for a conclusion shows beside the title, outside the totals.
 * BookingService scopes both reads to the manager's center; pending ones are concluded from the bookings page.
 */
export function CaregiverAbsenceHistory({ caregiverId }: { caregiverId: string }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const statistics = useQuery({
    queryKey: bookingKeys.absenceStatistics({ caregiverId }),
    queryFn: () => fetchCaregiverAbsenceStatistics({ caregiverId }),
    retry: false
  })
  const listParams = { caregiverId, page, size }
  const recent = useQuery({
    queryKey: bookingKeys.absences(listParams),
    queryFn: () => fetchCaregiverAbsences(listParams),
    placeholderData: keepPreviousData,
    retry: false
  })
  const error = statistics.error ?? recent.error
  const items = recent.data?.items ?? []
  const pending = statistics.data?.pending ?? 0

  return (
    <section
      aria-labelledby='caregiver-absence-history-title'
      className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='flex items-center gap-2 text-lg font-bold' id='caregiver-absence-history-title'>
              <Icon className='text-error' name='person_off' />
              {t(`${key}.title`)}
            </h2>
            {pending > 0 ? (
              <StatusBadge dot tone='warning'>
                {t('caregiverAbsence.pendingCount', { count: pending })}
              </StatusBadge>
            ) : null}
          </div>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
        </div>
        {pending > 0 ? (
          <Link
            className='inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-surface-container-low'
            to='/center-manager/bookings'
          >
            {t(`${key}.openQueue`)}
            <Icon className='text-base' name='chevron_right' />
          </Link>
        ) : null}
      </div>
      {statistics.isPending || recent.isPending ? (
        <p className='mt-4 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {error ? (
        <p className='mt-4 text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(error, `${key}.error`))}
        </p>
      ) : null}
      {statistics.data ? (
        <dl className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {STATS.map(([name, tone]) => (
            <div className='rounded-xl bg-surface-container-low px-3 py-2.5' key={name}>
              <dt className='text-xs text-on-surface-variant'>{t(`caregiverAbsence.admin.stats.${name}`)}</dt>
              <dd className={`text-xl font-bold tabular-nums ${tone}`}>{statistics.data[name]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {statistics.isSuccess && recent.isSuccess && items.length === 0 ? (
        <p className='mt-4 rounded-xl bg-surface-container-low px-4 py-5 text-center text-sm text-on-surface-variant'>
          {t(`${key}.empty`)}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className='mt-4 flex flex-col gap-2'>
          {groupByBooking(items).map(({ bookingId, rows }) => {
            const waiting = rows.filter((row) => row.status === 'PENDING').length
            return (
              <BookingGroupCard
                badge={
                  waiting > 0 ? (
                    <StatusBadge tone='warning'>{t('caregiverAbsence.pendingCount', { count: waiting })}</StatusBadge>
                  ) : undefined
                }
                bookingCode={rows[0].bookingCode}
                countLabel={t('booking.group.visits', { count: rows.length })}
                href={`/center-manager/bookings/${bookingId}`}
                key={bookingId}
                recipientName={rows[0].recipientName}
              >
                {rows.map((item) => (
                  <CaregiverAbsenceCard item={item} key={item.id} />
                ))}
              </BookingGroupCard>
            )
          })}
        </ul>
      ) : null}
      {recent.data ? (
        <Pagination
          className='mt-3'
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setSize(value)
            setPage(0)
          }}
          page={page}
          pageSize={size}
          pageSizeOptions={[5, 10, 20]}
          totalElements={recent.data.totalElements}
          totalPages={recent.data.totalPages}
        />
      ) : null}
    </section>
  )
}
