import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { revenuePreview as data } from '../revenue-preview'

const key = 'admin.revenuePage' as const

export function RevenueAnalytics() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  const percentage = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)
  const decimal = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)
  return (
    <div className='grid gap-5 lg:grid-cols-3'>
      <section className='rounded-xl bg-white p-5 shadow-sm lg:col-span-2 sm:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.chart`)}</h2>
            <p className='mt-1 text-sm text-outline'>{t(`${key}.chartHint`)}</p>
          </div>
          <span className='rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary'>
            {t(`${key}.chartPeriods.month`)}
          </span>
        </div>
        <div className='mt-5 flex justify-end gap-3 text-xs'>
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-sm bg-outline' />
            {t(`${key}.chartLegend.gmv`)}
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-sm bg-primary' />
            {t(`${key}.chartLegend.net`)}
          </span>
        </div>
        <svg
          aria-label={t(`${key}.chartHint`)}
          className='mt-3 h-56 w-full'
          preserveAspectRatio='none'
          role='img'
          viewBox='0 0 700 200'
        >
          <g stroke='var(--color-surface-container-highest)' strokeDasharray='3 3'>
            <line x1='0' x2='700' y1='30' y2='30' />
            <line x1='0' x2='700' y1='80' y2='80' />
            <line x1='0' x2='700' y1='130' y2='130' />
            <line x1='0' x2='700' y1='180' y2='180' />
          </g>
          <polygon
            fill='var(--color-surface-container-low)'
            points='0,180 0,110 100,95 200,120 300,75 400,60 500,45 600,65 700,40 700,180'
          />
          <polyline
            fill='none'
            points='0,110 100,95 200,120 300,75 400,60 500,45 600,65 700,40'
            stroke='var(--color-outline)'
            strokeWidth='2'
          />
          <polygon
            fill='var(--color-secondary-container)'
            points='0,180 0,165 100,160 200,168 300,150 400,140 500,135 600,142 700,130 700,180'
          />
          <polyline
            fill='none'
            points='0,165 100,160 200,168 300,150 400,140 500,135 600,142 700,130'
            stroke='var(--color-primary)'
            strokeWidth='3'
          />
        </svg>
        <div className='mt-2 flex justify-between text-xs tabular-nums text-outline'>
          {[1, 5, 10, 15, 20, 25, 30].map((day) => (
            <span key={day}>
              {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(
                new Date(`2026-09-${String(day).padStart(2, '0')}T00:00:00Z`)
              )}
            </span>
          ))}
        </div>
        <div className='mt-5 grid gap-3 rounded-lg bg-surface-container-low p-4 sm:grid-cols-3'>
          {[
            { key: 'average' as const, value: money(data.averageDaily) },
            { key: 'refundRate' as const, value: percentage(data.refundRate) },
            {
              key: 'reconciliationTime' as const,
              value: t(`${key}.hours`, { value: decimal(data.averageReconciliationHours) })
            }
          ].map((metric) => (
            <div key={metric.key}>
              <p className='text-xs text-outline'>{t(`${key}.${metric.key}`)}</p>
              <strong className='mt-1 block text-sm tabular-nums'>{metric.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-6'>
        <h2 className='text-lg font-bold'>{t(`${key}.escrowModel`)}</h2>
        <p className='mt-1 text-sm leading-6 text-outline'>{t(`${key}.escrowHint`)}</p>
        <div className='mt-6 flex h-3 overflow-hidden rounded-full bg-surface-container'>
          {data.split.map((split) => (
            <span className={`${split.color} h-full`} key={split.key} style={{ width: `${split.share * 100}%` }} />
          ))}
        </div>
        <div className='mt-5 space-y-2'>
          {data.split.map((split) => (
            <div
              className='flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3 text-xs'
              key={split.key}
            >
              <span className='flex items-center gap-2'>
                <span className={`h-2.5 w-2.5 rounded-sm ${split.color}`} />
                {t(`${key}.split.${split.key}`)} ({percentage(split.share)})
              </span>
              <strong className='tabular-nums'>{money(data.gmv * split.share)}</strong>
            </div>
          ))}
        </div>
        <div className='mt-6 border-t border-outline-variant/25 pt-4'>
          <h3 className='flex items-center gap-2 text-sm font-bold'>
            <Icon className='text-primary' name='account_balance' />
            {t(`${key}.gatewayStatus`)}
          </h3>
          <p className='mt-2 text-xs leading-5 text-outline'>{t(`${key}.gatewayHint`)}</p>
        </div>
      </section>
    </div>
  )
}
