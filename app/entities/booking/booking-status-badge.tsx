import { useTranslation } from 'react-i18next'

import type { BookingStatus, OccurrenceStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

export const BOOKING_STATUS_TONES: Record<BookingStatus, StatusTone> = {
  PENDING: 'warning',
  AWAITING_DEPOSIT: 'caution',
  CONFIRMED: 'info',
  IN_PROGRESS: 'active',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral'
}

export const OCCURRENCE_STATUS_TONES: Record<OccurrenceStatus, StatusTone> = {
  SCHEDULED: 'info',
  ACKNOWLEDGED: 'info',
  IN_PROGRESS: 'active',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  MISSED: 'danger',
  CUSTOMER_NO_SHOW: 'warning'
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation()
  return <StatusBadge tone={BOOKING_STATUS_TONES[status]}>{t(`booking.status.${status}`)}</StatusBadge>
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const { t } = useTranslation()
  return <StatusBadge tone={OCCURRENCE_STATUS_TONES[status]}>{t(`booking.occurrenceStatus.${status}`)}</StatusBadge>
}
