import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'

import { fetchCenterStatistics, fetchProviderStatistics, fetchSystemStatistics, statisticsKeys } from './statistics-api'

type OperationalScope = 'center' | 'system'

function QueryMessage({ retry, error }: { retry: () => void; error: boolean }) {
  const { t } = useTranslation()
  return (
    <div
      className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs'
      role={error ? 'alert' : 'status'}
    >
      <p className={error ? 'text-sm font-medium text-error' : 'text-sm text-on-surface-variant'}>
        {t(error ? 'statistics.error' : 'statistics.loading')}
      </p>
      {error ? (
        <button
          className='mt-3 min-h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container-low'
          onClick={retry}
          type='button'
        >
          {t('statistics.retry')}
        </button>
      ) : null}
    </div>
  )
}

export function OperationalStatisticsPanel({ scope }: { scope: OperationalScope }) {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: scope === 'center' ? statisticsKeys.center : statisticsKeys.system,
    queryFn: scope === 'center' ? fetchCenterStatistics : fetchSystemStatistics,
    retry: false
  })
  if (query.isPending || query.isError) {
    return <QueryMessage error={query.isError} retry={() => void query.refetch()} />
  }

  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage ?? 'vi').format(value)
  const data = query.data
  const totalBookings = Object.values(data.bookingsByStatus ?? {}).reduce((sum, count) => sum + count, 0)
  const outcomes = [
    { key: 'completed', count: data.occurrences?.completed ?? 0, color: 'bg-primary' },
    { key: 'cancelled', count: data.occurrences?.cancelled ?? 0, color: 'bg-error' },
    { key: 'missed', count: data.occurrences?.missed ?? 0, color: 'bg-warning' },
    { key: 'noShow', count: data.occurrences?.customerNoShow ?? 0, color: 'bg-outline' }
  ] as const
  const totalOutcomes = outcomes.reduce((sum, item) => sum + item.count, 0)
  const completionRate = totalOutcomes ? Math.round((outcomes[0].count / totalOutcomes) * 100) : 0
  const metrics = [
    { key: 'bookings', value: number(totalBookings) },
    { key: 'completed', value: number(outcomes[0].count) },
    { key: 'completionRate', value: `${number(completionRate)}%` },
    { key: 'rating', value: number(data.avgRating ?? 0) },
    { key: 'complaints', value: number(data.complaints?.open ?? 0) }
  ] as const

  return (
    <section aria-label={t('statistics.title')} className='space-y-4'>
      <div>
        <h2 className='text-xl font-bold text-on-surface'>{t('statistics.title')}</h2>
        <p className='text-sm text-on-surface-variant'>{t('statistics.period')}</p>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {metrics.map((metric) => (
          <div
            className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs'
            key={metric.key}
          >
            <p className='text-xs font-semibold text-on-surface-variant'>{t(`statistics.${metric.key}`)}</p>
            <p className='mt-2 text-2xl font-extrabold tabular-nums text-primary'>{metric.value}</p>
          </div>
        ))}
      </div>
      <div className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs'>
        <h3 className='font-bold text-on-surface'>{t('statistics.occurrences')}</h3>
        {totalOutcomes ? (
          <>
            <div
              className='mt-4 flex h-3.5 overflow-hidden rounded-full bg-surface-container'
              role='img'
              aria-label={t('statistics.occurrences')}
            >
              {outcomes.map((item) =>
                item.count ? (
                  <div
                    className={item.color}
                    key={item.key}
                    style={{ width: `${(item.count / totalOutcomes) * 100}%` }}
                  />
                ) : null
              )}
            </div>
            <dl className='mt-4 grid gap-3 sm:grid-cols-4'>
              {outcomes.map((item) => (
                <div
                  className='flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2 text-sm'
                  key={item.key}
                >
                  <dt className='text-on-surface-variant'>{t(`statistics.${item.key}`)}</dt>
                  <dd className='font-bold tabular-nums text-on-surface'>{number(item.count)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className='mt-3 text-sm text-outline'>{t('statistics.noData')}</p>
        )}
      </div>
    </section>
  )
}

export function ProviderStatusPanel() {
  const { t, i18n } = useTranslation()
  const query = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  if (query.isPending || query.isError) {
    return <QueryMessage error={query.isError} retry={() => void query.refetch()} />
  }

  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage ?? 'vi').format(value)
  const statusLabels: Record<string, string> = {
    PENDING: t('statistics.statuses.PENDING'),
    ACTIVE: t('statistics.statuses.ACTIVE'),
    INACTIVE: t('statistics.statuses.INACTIVE'),
    SUSPENDED: t('statistics.statuses.SUSPENDED'),
    REJECTED: t('statistics.statuses.REJECTED'),
    ARCHIVED: t('statistics.statuses.ARCHIVED'),
    VERIFIED: t('statistics.statuses.VERIFIED')
  }
  const groups = [
    { key: 'centers', counts: query.data.centersByStatus },
    { key: 'caregivers', counts: query.data.caregiversByStatus },
    { key: 'verification', counts: query.data.caregiversByVerification }
  ] as const

  return (
    <section aria-label={t('statistics.providerTitle')} className='space-y-4'>
      <h2 className='text-xl font-bold text-on-surface'>{t('statistics.providerTitle')}</h2>
      <div className='grid gap-4 lg:grid-cols-3'>
        {groups.map((group) => (
          <div
            className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs'
            key={group.key}
          >
            <h3 className='font-bold text-on-surface'>{t(`statistics.${group.key}`)}</h3>
            {Object.entries(group.counts ?? {}).length ? (
              <dl className='mt-4 space-y-2.5'>
                {Object.entries(group.counts ?? {}).map(([status, count]) => (
                  <div className='flex items-center justify-between gap-3 text-sm' key={status}>
                    <dt>
                      <ProviderStatusBadge label={statusLabels[status] ?? status} status={status} />
                    </dt>
                    <dd className='font-bold tabular-nums text-on-surface'>{number(count)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className='mt-4 text-sm text-outline'>{t('statistics.noData')}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
