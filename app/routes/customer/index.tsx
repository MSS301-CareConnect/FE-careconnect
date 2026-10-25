import { useTranslation } from 'react-i18next'

import { HomePage } from '~/features/home/home-page'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

export default function CustomerIndexRoute() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.home.documentTitle'))

  return <HomePage audience='customer' />
}
