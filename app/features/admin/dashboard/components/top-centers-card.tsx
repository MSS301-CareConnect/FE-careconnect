import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { OperationalStatisticsRecord } from '~/shared/api/generated/contracts'
import { BarList } from '~/shared/ui/charts/bar-list'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors } from '~/shared/ui/charts/chart-colors'

const key = 'statistics.insights.topCenters' as const
const LIMIT = 6

/** Centers ranked by the bookings created in the period (BookingService per-center breakdown), by name. */
export function TopCentersCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t, i18n } = useTranslation()
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 })
  const ranked = (data.byCenter?.items ?? [])
    .filter((row) => row.centerId)
    .map((row) => ({
      centerId: row.centerId!,
      bookings: Object.values(row.statistics?.bookingsByStatus ?? {}).reduce((sum, value) => sum + value, 0),
      completionRate: row.statistics?.completionRate ?? 0
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, LIMIT)
  const nameOf = useCenterNames(ranked.map((row) => row.centerId))
  const items = ranked.map((row) => ({
    key: row.centerId,
    label: (
      <Link className='hover:text-forest-700 hover:underline' to={`/admin/centers/${row.centerId}`}>
        {nameOf(row.centerId)}
      </Link>
    ),
    value: row.bookings,
    display: t(`${key}.bookings`, { count: row.bookings }),
    hint: t(`${key}.completion`, { rate: percent.format(row.completionRate / 100) })
  }))
  return (
    <ChartCard className={className} description={t(`${key}.hint`)} title={t(`${key}.title`)}>
      <BarList color={chartColors.c3} format={(value) => String(value)} items={items} />
    </ChartCard>
  )
}
