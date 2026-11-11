import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { OperationalStatisticsRecord } from '~/shared/api/generated/contracts'
import { KpiTile } from '~/shared/ui/charts/kpi-tile'
import { staggerVariants } from '~/shared/ui/motion'

const key = 'statistics.insights.kpis' as const
const WAITING = [
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT'
] as const

/** The six headline numbers of a period, from one BookingService statistics response (center or platform). */
export function OperationalKpis({ data }: { data: OperationalStatisticsRecord }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language)
  const decimal = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const whole = (value: number) => number.format(Math.round(value))
  const statuses = data.bookingsByStatus ?? {}
  const bookings = Object.values(statuses).reduce((sum, value) => sum + value, 0)
  const waiting = WAITING.reduce((sum, status) => sum + (statuses[status] ?? 0), 0)
  const occurrences = data.occurrences
  const ended =
    (occurrences?.completed ?? 0) +
    (occurrences?.cancelled ?? 0) +
    (occurrences?.missed ?? 0) +
    (occurrences?.customerNoShow ?? 0)
  const minutes = data.responsiveness?.avgResponseMinutes
  const openComplaints = (data.complaints?.open ?? 0) + (data.complaints?.inProgress ?? 0)
  const responseText = (value: number) =>
    minutes === undefined || minutes === null
      ? t('statistics.responsiveness.none')
      : value < 60
        ? t('statistics.responsiveness.minutes', { count: Math.round(value) })
        : t('statistics.responsiveness.hours', { hours: Math.floor(value / 60), minutes: Math.round(value % 60) })

  return (
    <motion.div
      className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'
      initial='hidden'
      variants={staggerVariants(0.06)}
      viewport={{ once: true, amount: 0.2 }}
      whileInView='shown'
    >
      <KpiTile
        format={whole}
        hint={t(`${key}.bookingsHint`, { count: waiting })}
        icon='calendar_month'
        label={t(`${key}.bookings`)}
        tone='dark'
        value={bookings}
      />
      <KpiTile
        format={whole}
        hint={t(`${key}.completedVisitsHint`, { count: ended })}
        icon='task_alt'
        label={t(`${key}.completedVisits`)}
        value={occurrences?.completed ?? 0}
      />
      <KpiTile
        format={(value) => `${whole(value)}%`}
        hint={t(`${key}.completionRateHint`)}
        icon='donut_large'
        label={t(`${key}.completionRate`)}
        tone='mint'
        value={data.completionRate ?? 0}
      />
      <KpiTile
        format={(value) => decimal.format(value)}
        hint={t(`${key}.ratingHint`, { count: data.reviewCount ?? 0 })}
        icon='star'
        label={t(`${key}.rating`)}
        value={data.avgRating ?? 0}
      />
      <KpiTile
        format={whole}
        hint={t(`${key}.complaintsHint`, { count: data.complaints?.escalated ?? 0 })}
        icon='report'
        label={t(`${key}.complaints`)}
        tone={openComplaints > 0 ? 'peach' : 'light'}
        value={openComplaints}
      />
      <KpiTile
        format={responseText}
        hint={t(`${key}.responseTimeHint`, { count: data.responsiveness?.expiredCount ?? 0 })}
        icon='schedule'
        label={t(`${key}.responseTime`)}
        value={minutes ?? 0}
      />
    </motion.div>
  )
}
