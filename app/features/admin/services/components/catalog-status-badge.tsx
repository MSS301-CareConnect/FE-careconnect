import { useTranslation } from 'react-i18next'

import type { CatalogItemRequestStatus } from '~/shared/api/generated/contracts'
import { StatusBadge } from '~/shared/ui/status-badge'

export function CatalogStatusBadge({ status }: { status: CatalogItemRequestStatus }) {
  const { t } = useTranslation()
  return (
    <StatusBadge tone={status === 'ACTIVE' ? 'success' : 'neutral'}>
      {t(`admin.servicesPage.statuses.${status}`)}
    </StatusBadge>
  )
}
