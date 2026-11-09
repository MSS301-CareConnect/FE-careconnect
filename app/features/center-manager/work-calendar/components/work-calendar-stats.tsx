import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'
import { Skeleton } from '~/shared/ui/skeleton'

const k = 'centerManager.schedules.stats' as const

export interface CalendarNumbers {
  shifts: number
  minutes: number
  staffed: number
  team: number
  onLeaveNow: number
  weekLeaves: number
  clashes: number
  cancelled: number
}

/** Four numbers for the week shown: shifts and hours, who works, who is off, and shifts that need a look. */
export function WorkCalendarStats({
  numbers,
  loading,
  onShowTimeOff
}: {
  numbers?: CalendarNumbers
  loading: boolean
  onShowTimeOff: () => void
}) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const value = (amount: number | undefined) =>
    loading || amount === undefined ? (
      <Skeleton className='h-8 w-14 rounded-md' />
    ) : (
      <CountUp format={(n) => number.format(Math.round(n))} value={amount} />
    )
  const card =
    'flex min-h-[8.5rem] flex-col rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
  const label = 'flex items-center justify-between gap-2 text-sm font-medium text-on-surface-variant'
  const attention = (numbers?.clashes ?? 0) > 0

  return (
    <section aria-label={t(`${k}.label`)} className='ops-stagger grid grid-cols-2 gap-3 xl:grid-cols-4'>
      <div className={`${card} ops-stat-dark`}>
        <div className={label}>
          <span>{t(`${k}.shifts`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-primary' name='event_available' />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(numbers?.shifts)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {numbers && numbers.minutes > 0
            ? t(`${k}.hours`, { hours: format.duration(numbers.minutes) })
            : t(`${k}.noHours`)}
        </span>
      </div>
      <div className={card}>
        <div className={label}>
          <span>{t(`${k}.staffed`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-info' name='groups' />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {loading || !numbers ? (
            <Skeleton className='h-8 w-14 rounded-md' />
          ) : (
            `${number.format(numbers.staffed)}/${number.format(numbers.team)}`
          )}
        </strong>
        {numbers && numbers.team > 0 ? (
          <div aria-hidden='true' className='mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container'>
            <div
              className='h-full rounded-full bg-primary'
              style={{ width: `${Math.min(100, (numbers.staffed / numbers.team) * 100)}%` }}
            />
          </div>
        ) : null}
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>{t(`${k}.staffedHint`)}</span>
      </div>
      <button
        className={`${card} text-left transition-[border-color,box-shadow] duration-150 hover:border-warning hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${(numbers?.onLeaveNow ?? 0) > 0 ? 'border-peach-200 bg-peach-50' : ''}`}
        onClick={onShowTimeOff}
        type='button'
      >
        <span className={label}>
          <span>{t(`${k}.onLeave`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon className='text-xl text-warning' name='beach_access' />
          </span>
        </span>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(numbers?.onLeaveNow)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {t(`${k}.weekLeaves`, { count: numbers?.weekLeaves ?? 0 })}
        </span>
      </button>
      <div className={`${card} ${attention ? 'border-error/40 bg-error-container/40' : ''}`}>
        <div className={label}>
          <span>{t(`${k}.attention`)}</span>
          <span className='ops-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-50'>
            <Icon
              className={`text-xl ${attention ? 'text-error' : 'text-success'}`}
              name={attention ? 'warning' : 'task_alt'}
            />
          </span>
        </div>
        <strong className='ops-stat-value mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
          {value(numbers?.clashes)}
        </strong>
        <span className='mt-auto pt-1 text-xs text-on-surface-variant'>
          {attention ? t(`${k}.clashHint`) : t(`${k}.cancelledHint`, { count: numbers?.cancelled ?? 0 })}
        </span>
      </div>
    </section>
  )
}
