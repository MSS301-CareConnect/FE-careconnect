import { useTranslation } from 'react-i18next'

import type { OperationalStatisticsRecord } from '~/shared/api/generated/contracts'
import { BarList } from '~/shared/ui/charts/bar-list'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors, periodLabel } from '~/shared/ui/charts/chart-colors'
import { DonutChart } from '~/shared/ui/charts/donut-chart'
import { LineChart } from '~/shared/ui/charts/line-chart'
import { SegmentedControl } from '~/shared/ui/segmented-control'

import { INSIGHT_PERIODS, type InsightPeriod } from './statistics-period'

const key = 'statistics.insights' as const
const BOOKING_STATUSES = [
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED'
] as const
const BOOKING_TYPES = ['SHIFT', 'RECURRING', 'CUSTOM'] as const

export function useCount() {
  const { i18n } = useTranslation()
  const format = new Intl.NumberFormat(i18n.language)
  return (value: number) => format.format(Math.round(value))
}

/** This month · last 30 days · this year, shared by every dashboard section on the page. */
export function InsightPeriodSwitch({
  value,
  onChange
}: {
  value: InsightPeriod
  onChange: (value: InsightPeriod) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <p className='text-sm text-on-surface-variant'>{t(`${key}.periodHints.${value}`)}</p>
      <SegmentedControl
        className='w-full sm:w-[22rem]'
        legend={t(`${key}.periodLegend`)}
        onChange={onChange}
        options={INSIGHT_PERIODS.map((period) => ({ value: period, label: t(`${key}.periods.${period}`) }))}
        value={value}
      />
    </div>
  )
}

/** New bookings, completed and cancelled / missed visits per day (or month) of the period. */
export function BookingTrendCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t } = useTranslation()
  const count = useCount()
  const series = [
    { key: 'bookings', label: t(`${key}.trend.bookings`), color: chartColors.c3 },
    { key: 'completed', label: t(`${key}.trend.completed`), color: chartColors.c1 },
    { key: 'cancelled', label: t(`${key}.trend.cancelled`), color: chartColors.c2 }
  ] as const
  const points = (data.trend ?? []).map((point) => ({
    key: point.period,
    label: periodLabel(point.period),
    values: {
      bookings: point.bookings,
      completed: point.completedVisits,
      cancelled: point.cancelledVisits + point.missedVisits
    }
  }))
  return (
    <ChartCard className={className} description={t(`${key}.trend.hint`)} title={t(`${key}.trend.title`)}>
      <LineChart format={count} points={points} series={series} />
    </ChartCard>
  )
}

/** Completed · cancelled · caregiver missed · customer no-show among the visits that ended. */
export function VisitOutcomeCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t } = useTranslation()
  const count = useCount()
  const occurrences = data.occurrences
  const slices = [
    { key: 'completed', label: t('statistics.completed'), value: occurrences?.completed ?? 0, color: chartColors.c1 },
    { key: 'cancelled', label: t('statistics.cancelled'), value: occurrences?.cancelled ?? 0, color: chartColors.c2 },
    { key: 'missed', label: t('statistics.missed'), value: occurrences?.missed ?? 0, color: chartColors.c4 },
    { key: 'noShow', label: t('statistics.noShow'), value: occurrences?.customerNoShow ?? 0, color: chartColors.c5 }
  ]
  return (
    <ChartCard className={className} description={t(`${key}.outcomes.hint`)} title={t(`${key}.outcomes.title`)}>
      <DonutChart centerLabel={t(`${key}.outcomes.center`)} format={count} slices={slices} />
    </ChartCard>
  )
}

/** Bookings created in the period by their status now — where the queue piles up. */
export function BookingPipelineCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t } = useTranslation()
  const count = useCount()
  const counts = data.bookingsByStatus ?? {}
  const items = BOOKING_STATUSES.filter((status) => (counts[status] ?? 0) > 0).map((status) => ({
    key: status,
    label: t(`booking.status.${status}`),
    value: counts[status] ?? 0
  }))
  return (
    <ChartCard className={className} description={t(`${key}.pipeline.hint`)} title={t(`${key}.pipeline.title`)}>
      <BarList color={chartColors.c3} format={count} items={items} />
    </ChartCard>
  )
}

export function BookingTypeCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t } = useTranslation()
  const count = useCount()
  const counts = data.bookingsByType ?? {}
  const colors = [chartColors.c1, chartColors.c3, chartColors.c5]
  const slices = BOOKING_TYPES.map((type, index) => ({
    key: type,
    label: t(`booking.bookingType.${type}`),
    value: counts[type] ?? 0,
    color: colors[index]
  }))
  return (
    <ChartCard className={className} description={t(`${key}.types.hint`)} title={t(`${key}.types.title`)}>
      <DonutChart centerLabel={t(`${key}.types.center`)} format={count} slices={slices} />
    </ChartCard>
  )
}

/** Five rows, 5★ to 1★, on one scale, with the average in the header. */
export function RatingDistributionCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t, i18n } = useTranslation()
  const count = useCount()
  const distribution = data.ratingDistribution ?? {}
  const items = ['5', '4', '3', '2', '1'].map((star) => ({
    key: star,
    label: t(`${key}.ratings.star`, { count: Number(star) }),
    value: distribution[star] ?? 0
  }))
  const average = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(data.avgRating ?? 0)
  return (
    <ChartCard
      action={
        <span className='rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-forest-800'>
          {t(`${key}.ratings.average`, { value: average })}
        </span>
      }
      className={className}
      description={t(`${key}.ratings.hint`)}
      title={t(`${key}.ratings.title`)}
    >
      <BarList color={chartColors.c4} format={count} items={items} />
    </ChartCard>
  )
}

export function ComplaintsCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t } = useTranslation()
  const count = useCount()
  const complaints = data.complaints
  const slices = [
    { key: 'open', label: t(`${key}.complaintsCard.open`), value: complaints?.open ?? 0, color: chartColors.c2 },
    {
      key: 'inProgress',
      label: t(`${key}.complaintsCard.inProgress`),
      value: complaints?.inProgress ?? 0,
      color: chartColors.c3
    },
    {
      key: 'escalated',
      label: t(`${key}.complaintsCard.escalated`),
      value: complaints?.escalated ?? 0,
      color: chartColors.c5
    },
    {
      key: 'resolved',
      label: t(`${key}.complaintsCard.resolved`),
      value: complaints?.resolved ?? 0,
      color: chartColors.c1
    }
  ]
  return (
    <ChartCard
      className={className}
      description={t(`${key}.complaintsCard.hint`)}
      title={t(`${key}.complaintsCard.title`)}
    >
      <DonutChart format={count} slices={slices} />
    </ChartCard>
  )
}
