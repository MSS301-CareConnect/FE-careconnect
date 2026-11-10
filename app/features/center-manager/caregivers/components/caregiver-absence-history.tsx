import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchCaregiverAbsences, fetchCaregiverAbsenceStatistics } from '~/entities/booking/booking-api'
import { CaregiverAbsenceCard } from '~/entities/booking/caregiver-absence-card'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

const key = 'caregiverAbsence.profile' as const
const RECENT = 5
const STATS = [
  ['total', 'text-on-surface'],
  ['pending', 'text-peach-700'],
  ['excused', 'text-on-surface-variant'],
  ['confirmed', 'text-error']
] as const

/**
 * Missed visits of one caregiver (2026-11-10): counts by conclusion and the latest records. BookingService scopes both
 * reads to the manager's center; pending ones are concluded from the queue on the bookings page.
 */
export function CaregiverAbsenceHistory({ caregiverId }: { caregiverId: string }) {
  const { t } = useTranslation()
  const statistics = useQuery({
    queryKey: bookingKeys.absenceStatistics({ caregiverId }),
    queryFn: () => fetchCaregiverAbsenceStatistics({ caregiverId }),
    retry: false
  })
  const listParams = { caregiverId, page: 0, size: RECENT }
  const recent = useQuery({
    queryKey: bookingKeys.absences(listParams),
    queryFn: () => fetchCaregiverAbsences(listParams),
    retry: false
  })
  const error = statistics.error ?? recent.error
  const items = recent.data?.items ?? []
  const total = statistics.data?.total ?? 0

  return (
    <section
      aria-labelledby='caregiver-absence-history-title'
      className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-lg font-bold' id='caregiver-absence-history-title'>
            <Icon className='text-error' name='person_off' />
            {t(`${key}.title`)}
          </h2>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
        </div>
        {(statistics.data?.pending ?? 0) > 0 ? (
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
          {items.map((item) => (
            <CaregiverAbsenceCard
              actions={
                <Link
                  className='inline-flex min-h-10 items-center rounded-xl border border-outline-variant px-4 text-sm font-semibold text-on-surface hover:bg-surface-container-low'
                  to={`/center-manager/bookings/${item.bookingId}`}
                >
                  {t('caregiverAbsence.openBooking')}
                </Link>
              }
              item={item}
              key={item.id}
            />
          ))}
        </ul>
      ) : null}
      {total > items.length && items.length > 0 ? (
        <p className='mt-2 text-xs text-on-surface-variant'>
          {t('caregiverAbsence.more', { count: total - items.length })}
        </p>
      ) : null}
    </section>
  )
}
