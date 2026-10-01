import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import { adminDashboardPreview as data } from '../dashboard-preview'

const key = 'admin.dashboardPage' as const

export function DashboardCharts() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  const percentage = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)
  return (
    <div className='grid gap-5 lg:grid-cols-12'>
      <section className='rounded-xl bg-white p-5 shadow-sm lg:col-span-7 sm:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.bookingsChart`)}</h2>
            <p className='mt-1 text-sm text-outline'>{t(`${key}.bookingsChartHint`)}</p>
          </div>
          <div className='flex flex-wrap gap-3 text-xs'>
            {(['completed', 'active', 'cancelled'] as const).map((item, index) => (
              <span className='flex items-center gap-1.5' key={item}>
                <span className={`h-2.5 w-2.5 rounded-sm ${['bg-primary', 'bg-emerald-300', 'bg-error'][index]}`} />
                {t(`${key}.chartLegend.${item}`)} (
                {number([data.completedBookings, data.ongoingBookings, data.cancelledBookings][index])})
              </span>
            ))}
          </div>
        </div>
        <div className='mt-7 h-56 border-b border-outline-variant/25'>
          <svg
            aria-label={t(`${key}.bookingsChartHint`)}
            className='h-full w-full'
            preserveAspectRatio='none'
            role='img'
            viewBox='0 0 540 200'
          >
            <g stroke='#eff4ff'>
              <line x1='0' x2='540' y1='30' y2='30' />
              <line x1='0' x2='540' y1='80' y2='80' />
              <line x1='0' x2='540' y1='130' y2='130' />
              <line x1='0' x2='540' y1='180' y2='180' />
            </g>
            {[0, 1, 2, 3].map((week) => (
              <g key={week} transform={`translate(${50 + week * 130} 0)`}>
                <rect fill='#006b2c' height={110 + week * 15} rx='4' width='22' y={70 - week * 15} />
                <rect fill='#68dba9' height={35 + week * 8} rx='3' width='16' x='27' y={145 - week * 8} />
                <rect fill='#ba1a1a' height={Math.max(3, 6 - week)} rx='2' width='10' x='47' y={174 + week} />
              </g>
            ))}
            <path
              d='M61,65 C140,55 191,42 321,32 C380,27 420,18 451,15'
              fill='none'
              stroke='#00873a'
              strokeDasharray='4 3'
              strokeWidth='3'
            />
          </svg>
        </div>
        <div className='mt-2 flex justify-between text-xs text-outline'>
          {[1, 2, 3, 4].map((week) => (
            <span key={week}>{t(`${key}.week`, { count: week })}</span>
          ))}
        </div>
        <div className='mt-5 flex items-center justify-between gap-4 rounded-lg bg-surface-container-low p-4'>
          <div className='flex items-center gap-2'>
            <Icon className='text-primary' name='check_circle' />
            <span className='text-sm font-semibold'>{t(`${key}.completion`)}</span>
          </div>
          <div className='text-right'>
            <strong className='text-lg text-primary'>{percentage(data.completionRate)}</strong>
            <p className='text-xs text-outline'>{t(`${key}.completionHint`)}</p>
          </div>
        </div>
      </section>
      <section className='rounded-xl bg-white p-5 shadow-sm lg:col-span-5 sm:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.revenueChart`)}</h2>
            <p className='mt-1 text-sm text-outline'>
              {t(`${key}.revenueChartHint`, { amount: money(data.monthlyRevenue) })}
            </p>
          </div>
          <Link
            aria-label={t(`${key}.viewRevenue`)}
            className='rounded-lg bg-secondary-container p-2 text-primary hover:bg-secondary-container/70'
            to='/admin/revenue'
          >
            <Icon name='arrow_forward' />
          </Link>
        </div>
        <svg
          aria-label={t(`${key}.revenueChart`)}
          className='mt-6 h-36 w-full'
          preserveAspectRatio='none'
          role='img'
          viewBox='0 0 300 120'
        >
          <path d='M0,100 Q60,95 100,75 T200,45 T300,10 L300,120 L0,120 Z' fill='#e8fbe8' />
          <path d='M0,100 Q60,95 100,75 T200,45 T300,10' fill='none' stroke='#006b2c' strokeWidth='3' />
          <circle cx='300' cy='10' fill='#006b2c' r='4' />
        </svg>
        <div className='mt-5 space-y-4'>
          {data.services.map((service) => (
            <div key={service.key}>
              <div className='mb-1 flex justify-between gap-3 text-xs'>
                <span>{t(`${key}.services.${service.key}`)}</span>
                <strong className='text-primary'>
                  {percentage(service.share)} · {money(data.monthlyRevenue * service.share)}
                </strong>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-surface-container'>
                <div className={`h-full rounded-full ${service.color}`} style={{ width: `${service.share * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
