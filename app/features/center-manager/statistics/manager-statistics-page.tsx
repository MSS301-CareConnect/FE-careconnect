import { useTranslation } from 'react-i18next'

import { OperationalStatisticsPanel } from '~/entities/statistics/statistics-panels'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

export function ManagerStatisticsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('centerManager.statisticsPage.documentTitle'))

  return (
    <div className='mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
          {t('centerManager.statisticsPage.title')}
        </h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('centerManager.statisticsPage.subtitle')}</p>
      </header>
      <OperationalStatisticsPanel scope='center' />
    </div>
  )
}
