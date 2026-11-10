import { useTranslation } from 'react-i18next'

import { OperationalStatisticsPanel } from '~/entities/statistics/statistics-panels'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

import { CenterRevenuePanel } from './components/center-revenue-panel'

export function ManagerStatisticsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('centerManager.statisticsPage.documentTitle'))

  return (
    <div className={`${bentoContainer} space-y-7`}>
      <BentoPageHeader
        description={t('centerManager.statisticsPage.subtitle')}
        icon='monitoring'
        title={t('centerManager.statisticsPage.title')}
        variant='hero'
      />
      <OperationalStatisticsPanel scope='center' />
      <CenterRevenuePanel />
    </div>
  )
}
