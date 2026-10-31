import { useTranslation } from 'react-i18next'
import { OperationalStatisticsPanel, ProviderStatusPanel } from '~/entities/statistics/statistics-panels'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

const key = 'admin.dashboardPage' as const

/** Live operational numbers only; the sample financial charts stay out until a reporting contract exists (D26). */
export function AdminDashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
      </header>
      <OperationalStatisticsPanel scope='system' />
      <ProviderStatusPanel />
    </div>
  )
}
