import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { accountKeys, fetchAccountStatistics } from '~/entities/identity/account-api'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import { ChartCard } from '~/shared/ui/charts/chart-card'
import { chartColors } from '~/shared/ui/charts/chart-colors'
import { DonutChart } from '~/shared/ui/charts/donut-chart'
import { Skeleton } from '~/shared/ui/skeleton'

const key = 'admin.dashboardPage.partners' as const
const ROLES = ['CUSTOMER', 'CAREGIVER', 'CENTER_MANAGER', 'ADMIN'] as const
// Status → fixed colour, so a status keeps its colour whichever statuses a period has.
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: chartColors.c1,
  VERIFIED: chartColors.c1,
  PENDING: chartColors.c4,
  INACTIVE: chartColors.c3,
  SUSPENDED: chartColors.c2,
  REJECTED: chartColors.c2,
  ARCHIVED: chartColors.c5
}
const STATUSES = ['ACTIVE', 'VERIFIED', 'PENDING', 'INACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED'] as const

/** Accounts by role (Identity), centers by status and caregiver profile verification (ProviderService). */
export function PartnersSection() {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language)
  const count = (value: number) => number.format(value)
  const accounts = useQuery({ queryKey: accountKeys.statistics, queryFn: fetchAccountStatistics, retry: false })
  const providers = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  const statusSlices = (counts: Record<string, number> | undefined) =>
    STATUSES.filter((status) => (counts?.[status] ?? 0) > 0).map((status) => ({
      key: status,
      label: t(`statistics.statuses.${status}`),
      value: counts?.[status] ?? 0,
      color: STATUS_COLORS[status]
    }))
  const roleColors = [chartColors.c3, chartColors.c1, chartColors.c4, chartColors.c5]

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <ChartCard title={t(`${key}.accounts`)}>
        {accounts.data ? (
          <DonutChart
            centerLabel={t(`${key}.accountsCenter`)}
            format={count}
            slices={ROLES.map((role, index) => ({
              key: role,
              label: t(`admin.identity.roles.${role}`),
              value: accounts.data.usersByRole?.[role] ?? 0,
              color: roleColors[index]
            }))}
          />
        ) : accounts.isError ? (
          <p className='text-sm text-error'>{t('statistics.error')}</p>
        ) : (
          <Skeleton className='h-40 rounded-2xl' />
        )}
      </ChartCard>
      <ChartCard title={t(`${key}.centers`)}>
        {providers.data ? (
          <DonutChart
            centerLabel={t(`${key}.centersCenter`)}
            format={count}
            slices={statusSlices(providers.data.centersByStatus)}
          />
        ) : providers.isError ? (
          <p className='text-sm text-error'>{t('statistics.error')}</p>
        ) : (
          <Skeleton className='h-40 rounded-2xl' />
        )}
      </ChartCard>
      <ChartCard title={t(`${key}.verification`)}>
        {providers.data ? (
          <DonutChart
            centerLabel={t(`${key}.verificationCenter`)}
            format={count}
            slices={statusSlices(providers.data.caregiversByVerification)}
          />
        ) : providers.isError ? (
          <p className='text-sm text-error'>{t('statistics.error')}</p>
        ) : (
          <Skeleton className='h-40 rounded-2xl' />
        )}
      </ChartCard>
    </div>
  )
}
