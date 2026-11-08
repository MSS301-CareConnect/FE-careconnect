import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
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
    amount === null ? '—' : amount === undefined ? <Skeleton className='h-8 w-14 rounded-md' /> : number.format(amount)
  const card =
    'flex min-h-[7.5rem] flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4'
  const label = 'flex items-center justify-between gap-2 text-sm font-medium text-on-surface-variant'
  const interactive =
    'text-left transition-[border-color,box-shadow] duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  const hasPending = (pending ?? 0) > 0

  return (
    <section aria-label={t(`${k}.label`)} className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
      <div className={card}>
        <div className={label}>
          <span>{t(`${k}.total`)}</span>
          <Icon className='text-xl text-primary' name='groups' />
        </div>
        <strong className='mt-2 text-3xl font-bold tabular-nums'>{value(total)}</strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.totalHint`)}</span>
      </div>
      <button
        aria-pressed={pendingActive}
        className={`${card} ${interactive} ${hasPending ? 'border-warning/50 bg-warning-container/50 hover:border-warning' : 'hover:border-primary/40'} ${pendingActive ? 'ring-2 ring-warning' : ''}`}
        onClick={onShowPending}
        type='button'
      >
        <span className={label}>
          <span>{t(`${k}.pending`)}</span>
          <Icon className={`text-xl ${hasPending ? 'text-warning' : 'text-outline'}`} name='pending_actions' />
        </span>
        <strong className='mt-2 text-3xl font-bold tabular-nums'>{value(pending)}</strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {t(hasPending ? `${k}.pendingHint` : `${k}.pendingNone`)}
        </span>
      </button>
      <Link className={`${card} ${interactive} hover:border-primary/40`} to='/center-manager/schedules'>
        <span className={label}>
          <span>{t(`${k}.working`)}</span>
          <Icon className='text-xl text-success' name='event_available' />
        </span>
        <strong className='mt-2 text-3xl font-bold tabular-nums'>{value(working)}</strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.workingHint`)}</span>
      </Link>
      <Link
        className={`${card} ${interactive} ${(onLeave ?? 0) > 0 ? 'border-warning/50 bg-warning-container/40' : ''} hover:border-warning`}
        to='/center-manager/schedules?view=timeOff'
      >
        <span className={label}>
          <span>{t(`${k}.onLeave`)}</span>
          <Icon className='text-xl text-warning' name='beach_access' />
        </span>
        <strong className='mt-2 text-3xl font-bold tabular-nums'>{value(onLeave)}</strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.onLeaveHint`)}</span>
      </Link>
    </section>
  )
}
