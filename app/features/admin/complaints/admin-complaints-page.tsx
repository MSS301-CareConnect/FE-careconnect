import { useTranslation } from 'react-i18next'

import { ComplaintQueue } from '~/entities/aftercare/complaint-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

export function AdminComplaintsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('aftercare.queue.adminTitle'))
  return (
    <div className='flex flex-col gap-4 p-5 lg:p-8'>
      <h1 className='text-2xl font-bold'>{t('aftercare.queue.adminTitle')}</h1>
      <ComplaintQueue role='ADMIN' />
    </div>
  )
}
