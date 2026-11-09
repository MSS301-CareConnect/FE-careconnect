import { useTranslation } from 'react-i18next'
import { OperationalStatisticsPanel, ProviderStatusPanel } from '~/entities/statistics/statistics-panels'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const key = 'admin.dashboardPage' as const

/** Live operational numbers only; the sample financial charts stay out until a reporting contract exists (D26). */
export function AdminDashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  return (
    <div className={`${bentoContainer} space-y-7`}>
      <BentoPageHeader description={t(`${key}.subtitle`)} icon='dashboard' title={t(`${key}.title`)} variant='hero' />
      <OperationalStatisticsPanel scope='system' />
      <ProviderStatusPanel />
    </div>
  )
}
