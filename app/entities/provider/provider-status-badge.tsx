import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

export const PROVIDER_STATUS_TONES: Record<string, StatusTone> = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  ADMIN_VERIFIED: 'success',
  APPROVED: 'success',
  OPEN: 'success',
  COMPLETED: 'success',
  IN_PROGRESS: 'active',
  CONFIRMED: 'info',
  CENTER_VERIFIED: 'info',
  SCHEDULED: 'info',
  ACKNOWLEDGED: 'info',
  PENDING: 'warning',
  AWAITING_DEPOSIT: 'caution',
  CUSTOMER_NO_SHOW: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
  LOCKED: 'danger',
  MISSED: 'danger',
  INACTIVE: 'neutral',
  ARCHIVED: 'neutral',
  CANCELLED: 'neutral',
  CLOSED: 'neutral',
  EXPIRED: 'neutral'
}

export function resolveStatusTone(status?: string | null): StatusTone {
  if (!status) return 'neutral'
  return PROVIDER_STATUS_TONES[status] ?? 'neutral'
}

export function ProviderStatusBadge({
  status,
  label,
  children
}: {
  status?: string | null
  label?: string
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const key = status ?? ''
  const defaultLabels: Record<string, string> = {
    PENDING: t('statistics.statuses.PENDING'),
    ACTIVE: t('statistics.statuses.ACTIVE'),
    INACTIVE: t('statistics.statuses.INACTIVE'),
    SUSPENDED: t('statistics.statuses.SUSPENDED'),
    REJECTED: t('statistics.statuses.REJECTED'),
    ARCHIVED: t('statistics.statuses.ARCHIVED'),
    VERIFIED: t('statistics.statuses.VERIFIED'),
    CENTER_VERIFIED: t('common.status.certificate.CENTER_VERIFIED'),
    ADMIN_VERIFIED: t('common.status.certificate.ADMIN_VERIFIED'),
    OPEN: t('common.status.shift.OPEN'),
    CLOSED: t('common.status.shift.CLOSED'),
    CANCELLED: t('common.status.shift.CANCELLED'),
    COMPLETED: t('common.status.shift.COMPLETED'),
    APPROVED: t('common.status.registration.APPROVED'),
    LOCKED: t('common.status.account.LOCKED')
  }

  return <StatusBadge tone={resolveStatusTone(status)}>{children ?? label ?? defaultLabels[key] ?? key}</StatusBadge>
}
