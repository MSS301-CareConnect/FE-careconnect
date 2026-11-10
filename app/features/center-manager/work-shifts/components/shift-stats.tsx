import { useTranslation } from 'react-i18next'

import type { ProviderWorkShiftStatisticsRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'

const k = 'centerManager.workShifts.stats' as const

/**
 * Four numbers: shifts in the next 7 days, understaffed ones among them (click: next 7 days with places left),
 * sign-ups to review (click: filter) and the fill rate of the current filter.
 */
export function ShiftStats({
  stats,
  loading,
  pendingActive,
  onShowPending,
  understaffedActive,
  onShowUnderstaffed
}: {
  stats?: ProviderWorkShiftStatisticsRecord
  loading: boolean
  pendingActive: boolean
  onShowPending: () => void
  understaffedActive: boolean
  onShowUnderstaffed: () => void
}) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const percent = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { style: 'percent' })
  const fill = stats && stats.capacityTotal > 0 ? stats.approvedTotal / stats.capacityTotal : undefined
  const pending = stats?.pendingRegistrations ?? 0
  const understaffed = stats?.understaffed7Days ?? 0
  const value = (amount: number | undefined) =>
    loading || amount === undefined ? (
      <Skeleton className='h-8 w-14 rounded-md' />
    ) : (
      <CountUp format={(n) => number.format(Math.round(n))} value={amount} />
    )
  const card =
    'flex min-h-[8.5rem] flex-col rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
  const label = 'flex items-center justify-between gap-2 text-sm font-medium text-on-surface-variant'

  return (
    <section aria-label={t(`${k}.label`)} className='ops-stagger grid grid-cols-2 gap-3 xl:grid-cols-4'>
      <div className={`${card} ops-stat-dark`}>
        <div className={label}>
          <span>{t(`${k}.upcoming`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-primary' name='date_range' />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(stats?.upcoming7Days)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-outline'>{t(`${k}.upcomingHint`)}</span>
      </div>
      <button
        aria-pressed={understaffedActive}
        className={`${card} text-left transition-[border-color,background-color,box-shadow] duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${understaffed > 0 ? 'border-error/40 bg-error-container/50 hover:border-error' : 'hover:border-primary/40'} ${understaffedActive ? 'ring-2 ring-error' : ''}`}
        disabled={loading}
        onClick={onShowUnderstaffed}
        type='button'
      >
        <span className={label}>
          <span>{t(`${k}.understaffed`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon
              className={`text-xl ${understaffed > 0 ? 'text-error' : 'text-success'}`}
              name={understaffed > 0 ? 'warning' : 'how_to_reg'}
            />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(stats?.understaffed7Days)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {understaffed > 0
            ? t(`${k}.understaffedHint`, { count: stats?.missingStaff7Days ?? 0 })
            : t(`${k}.understaffedNone`)}
        </span>
      </button>
      <button
        aria-pressed={pendingActive}
        className={`${card} text-left transition-[border-color,background-color,box-shadow] duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${pending > 0 ? 'border-peach-200 bg-peach-50 hover:border-warning' : 'hover:border-primary/40'} ${pendingActive ? 'ring-2 ring-warning' : ''}`}
        disabled={loading}
        onClick={onShowPending}
        type='button'
      >
        <span className={label}>
          <span>{t(`${k}.pending`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className={`text-xl ${pending > 0 ? 'text-warning' : 'text-outline'}`} name='pending_actions' />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(stats?.pendingRegistrations)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {t(pending > 0 ? `${k}.pendingHint` : `${k}.pendingHintNone`)}
        </span>
      </button>
      <div className={card}>
        <div className={label}>
          <span>{t(`${k}.fillRate`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-info' name='groups' />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {loading ? <Skeleton className='h-8 w-14 rounded-md' /> : fill === undefined ? '—' : percent.format(fill)}
        </strong>
        {fill !== undefined ? (
          <div aria-hidden='true' className='mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container'>
            <div className='h-full rounded-full bg-primary' style={{ width: `${Math.min(100, fill * 100)}%` }} />
          </div>
        ) : null}
        <span className='mt-auto pt-1 text-xs text-outline'>
          {stats && stats.capacityTotal > 0
            ? t(`${k}.fillRateHint`, {
                approved: number.format(stats.approvedTotal),
                capacity: number.format(stats.capacityTotal)
              })
            : t(`${k}.fillRateEmpty`)}
        </span>
      </div>
    </section>
  )
}
