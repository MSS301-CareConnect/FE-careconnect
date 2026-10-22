import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { DashboardCharts } from './components/dashboard-charts'
import { DashboardInsights } from './components/dashboard-insights'
import { adminDashboardPreview as data } from './dashboard-preview'

const key = 'admin.dashboardPage' as const

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const money = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  const stats = [
    { key: 'customers', icon: 'diversity_1', value: number(data.customers), hint: t(`${key}.stats.customersHint`) },
    {
      key: 'caregivers',
      icon: 'medical_services',
      value: number(data.caregivers),
      hint: t(`${key}.stats.caregiversHint`)
    },
    {
      key: 'bookings',
      icon: 'event_available',
      value: number(data.activeBookings),
      hint: t(`${key}.stats.bookingsHint`)
    },
    {
      key: 'revenue',
      icon: 'account_balance_wallet',
      value: money(data.monthlyGmv),
      hint: t(`${key}.stats.revenueHint`, { amount: money(data.monthlyGmv * data.platformFeeRate) })
    }
  ] as const
  useDocumentTitle(t(`${key}.documentTitle`))
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <span className='inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
            {t(`${key}.snapshot`)}
          </span>
          <h1 className='mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <label className='text-xs text-outline'>
            <span className='sr-only'>{t(`${key}.range`)}</span>
            <select
              aria-label={t(`${key}.range`)}
              className='rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm'
              defaultValue='sample'
            >
              <option value='sample'>{t(`${key}.range`)}</option>
            </select>
          </label>
          <button
            className='rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50'
            disabled
            title={t('admin.unavailable')}
            type='button'
          >
            {t(`${key}.export`)}
          </button>
          <button
            className='rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50'
            disabled
            title={t('admin.unavailable')}
            type='button'
          >
            {t(`${key}.refresh`)}
          </button>
        </div>
      </header>
      <p className='rounded-lg bg-secondary-container/40 px-4 py-3 text-xs leading-5 text-primary'>
        {t('admin.preview')}
      </p>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
                {t(`${key}.stats.${stat.key}`)}
              </h2>
              <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary'>
                <Icon name={stat.icon} />
              </span>
            </div>
            <p
              className={`mt-4 font-extrabold ${stat.key === 'revenue' ? 'break-words text-xl sm:text-2xl' : 'text-3xl'}`}
            >
              {stat.value}
            </p>
            <p className='mt-2 text-xs text-outline'>{stat.hint}</p>
          </section>
        ))}
      </div>
      <DashboardCharts />
      <DashboardInsights />
    </div>
  )
}
