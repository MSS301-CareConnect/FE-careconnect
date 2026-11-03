import { useTranslation } from 'react-i18next'

import type { BookingStatus, OccurrenceStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

export const BOOKING_STATUS_TONES: Record<BookingStatus, StatusTone> = {
  PENDING_CENTER_CONFIRMATION: 'warning',
  PENDING_CAREGIVER_CONFIRMATION: 'warning',
  PENDING_CAREGIVER_ASSIGNMENT: 'warning',
  AWAITING_INITIAL_PAYMENT: 'caution',
  CONFIRMED: 'info',
  IN_PROGRESS: 'active',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral'
}

export const OCCURRENCE_STATUS_TONES: Record<OccurrenceStatus, StatusTone> = {
  PENDING_ASSIGNMENT: 'warning',
  RESERVED: 'caution',
  SCHEDULED: 'info',
  ACKNOWLEDGED: 'info',
  IN_PROGRESS: 'active',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral',
  CUSTOMER_NO_SHOW: 'warning',
  CAREGIVER_MISSED: 'danger'
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation()
  return <StatusBadge tone={BOOKING_STATUS_TONES[status]}>{t(`booking.status.${status}`)}</StatusBadge>
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const { t } = useTranslation()
  return <StatusBadge tone={OCCURRENCE_STATUS_TONES[status]}>{t(`booking.occurrenceStatus.${status}`)}</StatusBadge>
}
