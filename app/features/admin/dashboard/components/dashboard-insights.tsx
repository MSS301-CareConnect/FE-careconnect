import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { adminDashboardPreview as data } from '../dashboard-preview'

const key = 'admin.dashboardPage' as const

export function DashboardInsights() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const percentage = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)
  return (
    <div className='grid gap-5 lg:grid-cols-3'>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.customerGrowth`)}</h2>
            <p className='mt-1 text-sm text-outline'>{t(`${key}.customerGrowthHint`)}</p>
          </div>
          <div className='text-right'>
            <strong className='text-xl tabular-nums text-primary'>{percentage(data.returningRate)}</strong>
            <p className='text-xs text-outline'>{t(`${key}.returningRate`)}</p>
          </div>
        </div>
        <svg
          aria-label={t(`${key}.customerGrowthHint`)}
          className='mt-7 h-36 w-full'
          preserveAspectRatio='none'
          role='img'
          viewBox='0 0 380 140'
        >
          <g stroke='var(--color-surface-container-low)'>
            <line x1='0' x2='380' y1='35' y2='35' />
            <line x1='0' x2='380' y1='70' y2='70' />
            <line x1='0' x2='380' y1='105' y2='105' />
          </g>
          <path
            d='M10,110 C80,95 140,80 200,50 C260,35 320,30 370,18'
            fill='none'
            stroke='var(--color-primary)'
            strokeWidth='3'
          />
          <path
            d='M10,120 C80,115 140,95 200,80 C260,70 320,55 370,42'
            fill='none'
            stroke='var(--color-tertiary-fixed-dim)'
            strokeDasharray='3 3'
            strokeWidth='3'
          />
        </svg>
        <div className='mt-5 grid grid-cols-2 gap-3'>
          {[
            { key: 'returning' as const, count: data.returningCustomers },
            { key: 'newCustomers' as const, count: data.newCustomers }
          ].map((item) => (
            <div className='rounded-lg bg-surface-container-low p-3' key={item.key}>
              <span className='text-xs text-on-surface-variant'>{t(`${key}.${item.key}`)}</span>
              <p className='mt-1 text-xl font-bold tabular-nums'>{number(item.count)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-6'>
        <h2 className='text-lg font-bold'>{t(`${key}.caregiverGrowth`)}</h2>
        <p className='mt-1 text-sm text-outline'>{t(`${key}.caregiverGrowthHint`)}</p>
        <div className='mt-7 flex flex-wrap items-center gap-5'>
          <div
            aria-label={t(`${key}.caregiverGrowthHint`)}
            className='relative h-32 w-32 shrink-0 rounded-full'
            role='img'
            style={{
              background:
                'conic-gradient(var(--color-primary) 0 58%, var(--color-tertiary-fixed-dim) 58% 84%, var(--color-tertiary) 84% 100%)'
            }}
          >
            <div className='absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white'>
              <strong className='text-2xl tabular-nums'>{number(data.caregivers)}</strong>
              <span className='text-xs text-outline'>{t(`${key}.workforce`)}</span>
            </div>
          </div>
          <div className='min-w-40 flex-1 space-y-3'>
            {data.caregiverGroups.map((group) => (
              <div className='flex items-center justify-between gap-2 text-xs' key={group.key}>
                <span className='flex items-center gap-1.5'>
                  <span className={`h-2.5 w-2.5 rounded-sm ${group.color}`} />
                  {t(`${key}.caregiverTypes.${group.key}`)}
                </span>
                <strong className='tabular-nums'>{number(group.count)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className='mt-6 flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3'>
          <span className='flex items-center gap-2 text-xs font-semibold'>
            <Icon className='text-primary' name='pending_actions' />
            {t(`${key}.pendingProfiles`, { count: data.pendingLicenses })}
          </span>
          <button
            className='rounded-lg bg-white px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50'
            disabled
            title={t('admin.unavailable')}
            type='button'
          >
            {t(`${key}.approve`)}
          </button>
        </div>
      </section>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h2 className='text-lg font-bold'>{t(`${key}.quality`)}</h2>
            <p className='mt-1 text-sm text-outline'>{t(`${key}.qualityHint`)}</p>
          </div>
          <span className='rounded-full bg-secondary-container px-2 py-1 text-xs font-semibold text-primary'>
            {t(`${key}.excellent`)}
          </span>
        </div>
        <div className='mt-5 flex items-center gap-4 rounded-lg bg-surface-container-low p-4'>
          <div className='text-center'>
            <strong className='text-4xl tabular-nums'>{number(data.rating)}</strong>
            <div className='mt-1 flex justify-center text-warning' aria-hidden='true'>
              {Array.from({ length: 5 }, (_, index) => (
                <Icon className='text-sm' key={index} name='star' filled />
              ))}
            </div>
          </div>
          <div>
            <p className='text-sm font-semibold'>{t(`${key}.reviews`, { count: data.reviews })}</p>
            <p className='mt-1 text-xs text-on-surface-variant'>{t(`${key}.recommendation`)}</p>
          </div>
        </div>
        <div className='mt-5 space-y-3'>
          {data.quality.map((metric) => (
            <div key={metric.key}>
              <div className='mb-1 flex justify-between gap-2 text-xs'>
                <span>{t(`${key}.qualityMetrics.${metric.key}`)}</span>
                <strong className='tabular-nums text-primary'>{percentage(metric.value)}</strong>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-surface-container'>
                <div className='h-full rounded-full bg-primary' style={{ width: `${metric.value * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className='mt-5 flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3'>
          <span className='flex items-center gap-2 text-xs'>
            <Icon className='text-primary' name='support_agent' />
            <span>
              <strong className='block'>{t(`${key}.hotline`)}</strong>
              <span className='text-outline'>{t(`${key}.hotlineHint`)}</span>
            </span>
          </span>
          <button
            aria-label={t(`${key}.call`)}
            className='rounded-lg bg-white p-2 text-primary disabled:opacity-50'
            disabled
            title={t('admin.unavailable')}
            type='button'
          >
            <Icon className='text-base' name='call' />
          </button>
        </div>
      </section>
    </div>
  )
}
