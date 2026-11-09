import { useTranslation } from 'react-i18next'

import { ComplaintQueue } from '~/entities/aftercare/complaint-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

export function ManagerComplaintsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('aftercare.queue.managerTitle'))
  return (
    <div className={bentoContainer}>
      <BentoPageHeader icon='reviews' title={t('aftercare.queue.managerTitle')} variant='hero' />
      <ComplaintQueue role='CENTER_MANAGER' />
    </div>
  )
}
