import { useTranslation } from 'react-i18next'

import { useCaregiverNames } from '~/entities/provider/use-provider-names'
import type { OperationalStatisticsRecord } from '~/shared/api/generated/contracts'
import { BarList } from '~/shared/ui/charts/bar-list'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors } from '~/shared/ui/charts/chart-colors'

const key = 'statistics.insights.topCaregivers' as const
const LIMIT = 6

/** Caregivers with the most completed visits, by name (ProviderService profile), with their rating in the period. */
export function TopCaregiversCard({ data, className }: { data: OperationalStatisticsRecord; className?: string }) {
  const { t, i18n } = useTranslation()
  const caregivers = (data.topCaregivers ?? []).filter((item) => item.caregiverId).slice(0, LIMIT)
  const nameOf = useCaregiverNames(caregivers.map((item) => item.caregiverId))
  const rating = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const items = caregivers.map((item) => ({
    key: item.caregiverId!,
    label: nameOf(item.caregiverId!),
    value: item.completedSessions ?? 0,
    display: t(`${key}.sessions`, { count: item.completedSessions ?? 0 }),
    hint: item.avgRating ? t(`${key}.rating`, { value: rating.format(item.avgRating) }) : t(`${key}.noRating`)
  }))
  return (
    <ChartCard className={className} description={t(`${key}.hint`)} title={t(`${key}.title`)}>
      <BarList color={chartColors.c1} format={(value) => String(value)} items={items} />
    </ChartCard>
  )
}
