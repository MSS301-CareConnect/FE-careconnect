import { useTranslation } from 'react-i18next'

import { ComplaintQueue } from '~/entities/aftercare/complaint-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

export function AdminComplaintsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('aftercare.queue.adminTitle'))
  return (
    <div className={bentoContainer}>
      <BentoPageHeader icon='forum' title={t('aftercare.queue.adminTitle')} variant='hero' />
      <ComplaintQueue role='ADMIN' />
    </div>
  )
}
