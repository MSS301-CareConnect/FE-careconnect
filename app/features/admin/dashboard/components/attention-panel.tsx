import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { InsightRange } from '~/entities/statistics/statistics-period'
import { fetchProviderStatistics, statisticsKeys } from '~/entities/statistics/statistics-api'
import { fetchWithdrawalStatistics, walletKeys } from '~/entities/wallet/wallet-api'
import type { OperationalStatisticsRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'admin.dashboardPage.attention' as const

/**
 * The admin's waiting queues as four links with live counts: centers to approve, caregivers to verify, center
 * withdrawals to transfer and complaints escalated by centers. A queue that cannot be read is left out.
 */
export function AttentionPanel({ data, range }: { data: OperationalStatisticsRecord; range: InsightRange }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language)
  const providers = useQuery({ queryKey: statisticsKeys.providers, queryFn: fetchProviderStatistics, retry: false })
  const withdrawals = useQuery({
    queryKey: walletKeys.withdrawalStatistics('REVIEW', range.from, range.to, range.groupBy),
    queryFn: () => fetchWithdrawalStatistics('REVIEW', range.from, range.to, range.groupBy),
    retry: false
  })
  const items = [
    {
      id: 'pendingCenters',
      icon: 'domain_add',
      to: '/admin/centers',
      count: providers.data ? (providers.data.centersByStatus?.PENDING ?? 0) : undefined
    },
    {
      id: 'pendingCaregivers',
      icon: 'badge',
      to: '/admin/caregivers',
      count: providers.data ? (providers.data.caregiversByVerification?.PENDING ?? 0) : undefined
    },
    {
      id: 'pendingWithdrawals',
      icon: 'payments',
      to: '/admin/withdrawals',
      count: withdrawals.data?.pendingCount
    },
    {
      id: 'escalatedComplaints',
      icon: 'forum',
      to: '/admin/reviews-complaints',
      count: data.complaints?.escalated ?? 0
    }
  ] as const

  return (
    <section
      aria-labelledby='admin-attention-title'
      className='rounded-3xl bg-forest-900 p-5 text-white shadow-[var(--shadow-float)] sm:p-6'
    >
      <h2 className='text-lg font-bold' id='admin-attention-title'>
        {t(`${key}.title`)}
      </h2>
      <p className='text-sm text-white/70'>{t(`${key}.hint`)}</p>
      <ul className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              aria-label={t(`${key}.open`, { name: t(`${key}.${item.id}`) })}
              className='group flex items-center gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-mint-300'
              to={item.to}
            >
              <span
                aria-hidden='true'
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.count ? 'bg-peach-300 text-forest-950' : 'bg-white/10 text-mint-200'}`}
              >
                <Icon className='text-lg' name={item.icon} />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block text-2xl leading-none font-extrabold tabular-nums'>
                  {item.count === undefined ? '–' : number.format(item.count)}
                </span>
                <span className='mt-1 block text-xs text-white/75'>{t(`${key}.${item.id}`)}</span>
              </span>
              <Icon
                className='text-lg text-white/50 transition-transform group-hover:translate-x-0.5'
                name='arrow_forward'
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
