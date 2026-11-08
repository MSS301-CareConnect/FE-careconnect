import { useTranslation } from 'react-i18next'

import { ComplaintQueue } from '~/entities/aftercare/complaint-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

export function ManagerComplaintsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('aftercare.queue.managerTitle'))
  return (
    <div className='flex flex-col gap-4 p-5 lg:p-8'>
      <h1 className='text-2xl font-bold'>{t('aftercare.queue.managerTitle')}</h1>
      <ComplaintQueue role='CENTER_MANAGER' />
    </div>
  )
}
