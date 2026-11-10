import { useTranslation } from 'react-i18next'

import type { CertificateAiCheckStatus, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import { hasAiResult, RISK_TONES } from './certificate-ai'

const STATUS_TONES: Record<CertificateAiCheckStatus | 'NONE', StatusTone> = {
  NONE: 'neutral',
  QUEUED: 'info',
  PROCESSING: 'active',
  COMPLETED: 'neutral',
  FAILED: 'error'
}

/** ADMIN: the AI risk of a checked certificate, otherwise where its AI check stands. */
export function CertificateAiBadge({ certificate }: { certificate: ProviderCertificateRecord }) {
  const { t } = useTranslation()
  if (hasAiResult(certificate) && certificate.aiRiskLevel) {
    return (
      <StatusBadge dot tone={RISK_TONES[certificate.aiRiskLevel]}>
        {t(`certificateReview.riskLevels.${certificate.aiRiskLevel}`)}
      </StatusBadge>
    )
  }
  const status = certificate.aiCheckStatus ?? 'NONE'
  return <StatusBadge tone={STATUS_TONES[status]}>{t(`certificateReview.aiStatuses.${status}`)}</StatusBadge>
}
