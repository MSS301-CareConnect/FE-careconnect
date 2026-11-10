import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'

const k = 'centerManager.management.roster.stats' as const

/** Team size, profiles to verify (click: filter), who works today and who is off now (links to the work schedule). */
export function CaregiverRosterStats({
  total,
  pending,
  working,
  onLeave,
  pendingActive,
  onShowPending
}: {
  total?: number
  pending?: number
  /** null = could not be read (shown as a dash). */
  working?: number | null
  onLeave?: number | null
  pendingActive: boolean
  onShowPending: () => void
}) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const value = (amount: number | null | undefined) =>
    amount === null ? (
      '—'
    ) : amount === undefined ? (
      <Skeleton className='h-8 w-14 rounded-md' />
    ) : (
      <CountUp format={(n) => number.format(Math.round(n))} value={amount} />
    )
  const card =
    'flex min-h-[8.5rem] flex-col rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
  const label = 'flex items-center justify-between gap-2 text-sm font-medium text-on-surface-variant'
  const interactive =
    'text-left transition-[border-color,box-shadow] duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  const hasPending = (pending ?? 0) > 0

  return (
    <section aria-label={t(`${k}.label`)} className='ops-stagger grid grid-cols-2 gap-3 xl:grid-cols-4'>
      <div className={`${card} ops-stat-dark`}>
        <div className={label}>
          <span>{t(`${k}.total`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-primary' name='groups' />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(total)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.totalHint`)}</span>
      </div>
      <button
        aria-pressed={pendingActive}
        className={`${card} ${interactive} ${hasPending ? 'border-peach-200 bg-peach-50 hover:border-warning' : 'hover:border-primary/40'} ${pendingActive ? 'ring-2 ring-warning' : ''}`}
        onClick={onShowPending}
        type='button'
      >
        <span className={label}>
          <span>{t(`${k}.pending`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className={`text-xl ${hasPending ? 'text-warning' : 'text-outline'}`} name='pending_actions' />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(pending)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {t(hasPending ? `${k}.pendingHint` : `${k}.pendingNone`)}
        </span>
      </button>
      <Link className={`${card} ${interactive} hover:border-primary/40`} to='/center-manager/schedules'>
        <span className={label}>
          <span>{t(`${k}.working`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-success' name='event_available' />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(working)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.workingHint`)}</span>
      </Link>
      <Link
        className={`${card} ${interactive} ${(onLeave ?? 0) > 0 ? 'border-peach-200 bg-peach-50' : ''} hover:border-warning`}
        to='/center-manager/schedules?view=timeOff'
      >
        <span className={label}>
          <span>{t(`${k}.onLeave`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-warning' name='beach_access' />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(onLeave)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.onLeaveHint`)}</span>
      </Link>
    </section>
  )
}
