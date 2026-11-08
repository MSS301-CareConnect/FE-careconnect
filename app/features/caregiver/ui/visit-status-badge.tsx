import { useTranslation } from 'react-i18next'

import type { OccurrenceStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

/**
 * Visit status colours of the caregiver portal: amber waits on the caregiver, blue is accepted, teal is running,
 * green is done, red is cancelled or missed, gray is over without care.
 */
export const VISIT_TONE: Record<OccurrenceStatus, StatusTone> = {
  PENDING_ASSIGNMENT: 'neutral',
  RESERVED: 'neutral',
  SCHEDULED: 'warning',
  ACKNOWLEDGED: 'info',
  IN_PROGRESS: 'active',
  COMPLETED: 'success',
  CANCELLED: 'error',
  EXPIRED: 'neutral',
  CUSTOMER_NO_SHOW: 'neutral',
  CAREGIVER_MISSED: 'error'
}

export function VisitStatusBadge({ status, className }: { status: OccurrenceStatus; className?: string }) {
  const { t } = useTranslation()
  return (
    <StatusBadge className={className} dot tone={VISIT_TONE[status]}>
      {t(`caregiver.ui.visitStatus.${status}`)}
    </StatusBadge>
  )
}
