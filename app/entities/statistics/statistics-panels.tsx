import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { ResponsivenessStatisticsRecord } from '~/shared/api/generated/contracts'
import { CountUp, easeSoft, revealVariants, staggerVariants } from '~/shared/ui/motion'

import { fetchCenterStatistics, fetchProviderStatistics, fetchSystemStatistics, statisticsKeys } from './statistics-api'

type OperationalScope = 'center' | 'system'

function QueryMessage({ retry, error }: { retry: () => void; error: boolean }) {
  const { t } = useTranslation()
  return (
    <div
      className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
      role={error ? 'alert' : 'status'}
    >
      <p className={error ? 'text-sm font-medium text-error' : 'text-sm text-on-surface-variant'}>
        {t(error ? 'statistics.error' : 'statistics.loading')}
      </p>
      {error ? (
        <button
          className='mt-3 min-h-9 rounded-full border border-forest-900/10 bg-white px-4 py-1.5 text-xs font-semibold text-forest-900 hover:bg-mint-50'
          onClick={retry}
          type='button'
        >
          {t('statistics.retry')}
        </button>
      ) : null}
    </div>
  )
}

function ResponsivenessCard({
  data,
  number
}: {
  data: ResponsivenessStatisticsRecord
  number: (value: number) => string
}) {
  const { t } = useTranslation()
  const minutes = data.avgResponseMinutes
  const average =
    minutes === undefined || minutes === null
      ? t('statistics.responsiveness.none')
      : minutes < 60
        ? t('statistics.responsiveness.minutes', { count: minutes })
        : t('statistics.responsiveness.hours', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
  const items = [
    { key: 'answered', value: number(data.answeredCount ?? 0), tone: 'text-primary' },
    { key: 'average', value: average, tone: 'text-primary' },
    { key: 'expired', value: number(data.expiredCount ?? 0), tone: data.expiredCount ? 'text-error' : 'text-primary' }
  ] as const
  return (
    <div className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
      <h3 className='font-bold text-on-surface'>{t('statistics.responsiveness.title')}</h3>
      <p className='mt-1 text-sm text-on-surface-variant'>{t('statistics.responsiveness.hint')}</p>
      <dl className='mt-4 grid gap-3 sm:grid-cols-3'>
        {items.map((item) => (
          <div className='rounded-2xl bg-mint-50 px-4 py-3' key={item.key}>
            <dt className='text-xs font-semibold text-on-surface-variant'>
              {t(`statistics.responsiveness.${item.key}`)}
            </dt>
            <dd className={`mt-1 text-xl font-extrabold tabular-nums ${item.tone}`}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function OperationalStatisticsPanel({ scope, centerId }: { scope: OperationalScope; centerId?: string }) {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey:
      scope === 'system'
        ? statisticsKeys.system
        : centerId
          ? statisticsKeys.centerById(centerId)
          : statisticsKeys.center,
    queryFn: () => (scope === 'center' ? fetchCenterStatistics(centerId) : fetchSystemStatistics()),
    retry: false
  })
  if (query.isPending || query.isError) {
    return <QueryMessage error={query.isError} retry={() => void query.refetch()} />
  }

  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage ?? 'vi').format(value)
  const data = query.data
  const totalBookings = Object.values(data.bookingsByStatus ?? {}).reduce((sum, count) => sum + count, 0)
  const outcomes = [
    { key: 'completed', count: data.occurrences?.completed ?? 0, color: 'bg-forest-700' },
    { key: 'cancelled', count: data.occurrences?.cancelled ?? 0, color: 'bg-peach-400' },
    { key: 'missed', count: data.occurrences?.missed ?? 0, color: 'bg-warning' },
    { key: 'noShow', count: data.occurrences?.customerNoShow ?? 0, color: 'bg-outline' }
  ] as const
  const totalOutcomes = outcomes.reduce((sum, item) => sum + item.count, 0)
  const completionRate = totalOutcomes ? Math.round((outcomes[0].count / totalOutcomes) * 100) : 0
  const whole = (value: number) => number(Math.round(value))
  const metrics = [
    { key: 'bookings', value: totalBookings, format: whole },
    { key: 'completed', value: outcomes[0].count, format: whole },
    { key: 'completionRate', value: completionRate, format: (value: number) => `${whole(value)}%` },
    { key: 'rating', value: data.avgRating ?? 0, format: (value: number) => number(Math.round(value * 10) / 10) },
    { key: 'complaints', value: data.complaints?.open ?? 0, format: whole }
  ] as const

  return (
    <section aria-label={t('statistics.title')} className='space-y-4'>
      <div>
        <h2 className='text-[22px] font-bold tracking-tight text-forest-950'>{t('statistics.title')}</h2>
        <p className='text-sm text-on-surface-variant'>{t('statistics.period')}</p>
      </div>
      <motion.div
        className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'
        initial='hidden'
        variants={staggerVariants(0.06)}
        viewport={{ once: true, amount: 0.3 }}
        whileInView='shown'
      >
        {metrics.map((metric, index) => (
          <motion.div
            className={
              index === 0
                ? 'rounded-2xl bg-forest-900 p-5 text-white shadow-[var(--shadow-float)]'
                : 'rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
            }
            key={metric.key}
            variants={revealVariants}
          >
            <p className={`text-xs font-semibold ${index === 0 ? 'text-white/70' : 'text-on-surface-variant'}`}>
              {t(`statistics.${metric.key}`)}
            </p>
            <p
              className={`mt-3 text-[30px] leading-none font-extrabold tracking-tight ${index === 0 ? 'text-white' : 'text-forest-950'}`}
            >
              <CountUp format={metric.format} value={metric.value} />
            </p>
          </motion.div>
        ))}
      </motion.div>
      {data.responsiveness ? <ResponsivenessCard data={data.responsiveness} number={number} /> : null}
      <div className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'>
        <h3 className='font-bold text-on-surface'>{t('statistics.occurrences')}</h3>
        {totalOutcomes ? (
          <>
            <div
              className='mt-4 flex h-4 gap-1 overflow-hidden rounded-full bg-surface-container'
              role='img'
              aria-label={t('statistics.occurrences')}
            >
              {outcomes.map((item) =>
                item.count ? (
                  <motion.div
                    className={`rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    key={item.key}
                    transition={{ duration: 0.8, ease: easeSoft }}
                    viewport={{ once: true }}
                    whileInView={{ width: `${(item.count / totalOutcomes) * 100}%` }}
                  />
                ) : null
              )}
            </div>
            <dl className='mt-4 grid gap-3 sm:grid-cols-4'>
              {outcomes.map((item) => (
                <div
                  className='flex items-center justify-between gap-3 rounded-full bg-surface-container-low px-4 py-2 text-sm'
                  key={item.key}
                >
                  <dt className='flex items-center gap-2 text-on-surface-variant'>
                    <span aria-hidden='true' className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    {t(`statistics.${item.key}`)}
                  </dt>
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
      <h2 className='text-[22px] font-bold tracking-tight text-forest-950'>{t('statistics.providerTitle')}</h2>
      <div className='grid gap-4 lg:grid-cols-3'>
        {groups.map((group) => (
          <div
            className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
            key={group.key}
          >
            <h3 className='font-bold text-on-surface'>{t(`statistics.${group.key}`)}</h3>
            {Object.entries(group.counts ?? {}).length ? (
              <dl className='mt-4 space-y-2.5'>
                {Object.entries(group.counts ?? {}).map(([status, count]) => {
                  const total = Object.values(group.counts ?? {}).reduce((sum, value) => sum + value, 0)
                  return (
                    <div className='text-sm' key={status}>
                      <div className='flex items-center justify-between gap-3'>
                        <dt>
                          <ProviderStatusBadge label={statusLabels[status] ?? status} status={status} />
                        </dt>
                        <dd className='font-bold tabular-nums text-on-surface'>{number(count)}</dd>
                      </div>
                      <div
                        aria-hidden='true'
                        className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container'
                      >
                        <motion.div
                          className='h-full rounded-full bg-mint-400'
                          initial={{ width: 0 }}
                          transition={{ duration: 0.8, ease: easeSoft }}
                          viewport={{ once: true }}
                          whileInView={{ width: `${total ? (count / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
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
