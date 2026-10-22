import { useTranslation } from 'react-i18next'

import type { CatalogItemRequestStatus } from '~/shared/api/generated/contracts'

export function CatalogStatusBadge({ status }: { status: CatalogItemRequestStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${status === 'ACTIVE' ? 'bg-secondary-container/40 text-primary' : 'bg-surface-container text-outline'}`}
    >
      {t(`admin.servicesPage.statuses.${status}`)}
    </span>
  )
}
