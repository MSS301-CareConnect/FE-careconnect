import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { apiRequestErrorKey } from '~/shared/api/error-details'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { fetchCaregiverWork, statisticsKeys } from './statistics-api'

const key = 'statistics.caregiverWork' as const
const TILES = [
  ['completed', 'completedVisits', 'text-forest-900'],
  ['upcoming', 'upcomingVisits', 'text-on-surface'],
  ['missed', 'missedVisits', 'text-error'],
  ['cancelled', 'cancelledVisits', 'text-on-surface-variant'],
  ['noShow', 'customerNoShowVisits', 'text-on-surface-variant']
] as const

/**
 * One caregiver's track record from BookingService (all time; a manager is scoped to their center, an admin may pass
 * `centerId`): visits by outcome, hours worked, rating, the latest completed visit and completed visits per service.
 */
export function CaregiverWorkCard({ caregiverId, centerId }: { caregiverId: string; centerId?: string }) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const params = { caregiverId, centerId }
  const work = useQuery({
    queryKey: statisticsKeys.caregiverWork(params),
    queryFn: () => fetchCaregiverWork(params),
    retry: false
  })
  const record = work.data?.find((item) => item.caregiverId === caregiverId)
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const services = record?.services ?? []
  const most = Math.max(1, ...services.map((service) => service.completedVisits))

  return (
    <section
      aria-labelledby='caregiver-work-title'
      className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'
    >
      <h2 className='flex items-center gap-2 text-lg font-bold' id='caregiver-work-title'>
        <Icon className='text-primary' name='task_alt' />
        {t(`${key}.title`)}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
      {work.isPending ? (
        <p className='mt-4 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {work.isError ? (
        <p className='mt-4 text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(work.error, `${key}.error`))}
        </p>
      ) : null}
      {work.isSuccess ? (
        <>
          <dl className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3'>
            <div className='rounded-xl bg-mint-50 px-3 py-2.5'>
              <dt className='text-xs text-on-surface-variant'>{t(`${key}.hours`)}</dt>
              <dd className='text-xl font-bold text-forest-900 tabular-nums'>
                {t(`${key}.hoursValue`, { value: number.format((record?.completedMinutes ?? 0) / 60) })}
              </dd>
            </div>
            {TILES.map(([label, field, tone]) => (
              <div className='rounded-xl bg-surface-container-low px-3 py-2.5' key={label}>
                <dt className='text-xs text-on-surface-variant'>{t(`${key}.${label}`)}</dt>
                <dd className={`text-xl font-bold tabular-nums ${tone}`}>{number.format(record?.[field] ?? 0)}</dd>
              </div>
            ))}
          </dl>
          <p className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant'>
            <span className='inline-flex items-center gap-1'>
              <Icon className='text-base text-warning' filled name='star' />
              {record?.ratingAverage != null && record.ratingCount > 0
                ? t(`${key}.ratingValue`, { score: number.format(record.ratingAverage), count: record.ratingCount })
                : t(`${key}.noRating`)}
            </span>
            {record?.lastCompletedAt ? (
              <span>{t(`${key}.lastCompleted`, { date: format.date(record.lastCompletedAt) })}</span>
            ) : null}
          </p>
          <h3 className='mt-5 text-sm font-semibold text-on-surface'>{t(`${key}.services`)}</h3>
          {services.length === 0 ? (
            <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.servicesEmpty`)}</p>
          ) : (
            <ul className='mt-2 flex flex-col gap-2.5'>
              {services.map((service) => (
                <li key={service.careServiceId}>
                  <div className='flex items-baseline justify-between gap-3 text-sm'>
                    <span className='min-w-0 truncate text-on-surface'>
                      {service.serviceName || t(`${key}.unknownService`)}
                    </span>
                    <span className='shrink-0 font-semibold tabular-nums'>
                      {t(`${key}.serviceVisits`, { count: service.completedVisits })}
                    </span>
                  </div>
                  <div aria-hidden='true' className='mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container-high'>
                    <div
                      className='h-full rounded-full bg-primary'
                      style={{ width: `${(service.completedVisits / most) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}
