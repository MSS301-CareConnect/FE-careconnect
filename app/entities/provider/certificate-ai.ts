import type {
  CertificateAiWarning,
  CertificateRiskLevel,
  ProviderCertificateRecord
} from '~/shared/api/generated/contracts'
import { apiErrorCode } from '~/shared/api/error-details'
import type { StatusTone } from '~/shared/ui/status-badge'

/** The details ProviderService compares between the declaration and the photos, in display order. */
export const CERTIFICATE_FIELDS = [
  'HOLDER_NAME',
  'CREDENTIAL_NUMBER',
  'CERTIFICATE_NAME',
  'ISSUED_BY',
  'ISSUED_DATE',
  'EXPIRY_DATE'
] as const
export type CertificateField = (typeof CERTIFICATE_FIELDS)[number]

export const RISK_LEVELS: CertificateRiskLevel[] = ['HIGH', 'UNDETERMINED', 'MEDIUM', 'LOW']

export const RISK_TONES: Record<CertificateRiskLevel, StatusTone> = {
  LOW: 'success',
  MEDIUM: 'caution',
  HIGH: 'danger',
  UNDETERMINED: 'warning'
}

const WARNING_CODES = ['NO_IMAGE', 'UNSUPPORTED_FILE', 'UNREADABLE', 'MISMATCH', 'NOT_FOUND', 'EXPIRED'] as const
export type WarningCode = (typeof WARNING_CODES)[number] | 'OTHER'

export type FieldResult = 'match' | 'mismatch' | 'notFound' | 'notDeclared'

export function isAiChecking(certificate: ProviderCertificateRecord) {
  return certificate.aiCheckStatus === 'QUEUED' || certificate.aiCheckStatus === 'PROCESSING'
}

export function hasAiResult(certificate: ProviderCertificateRecord) {
  return certificate.aiCheckStatus === 'COMPLETED' && Boolean(certificate.aiRiskLevel)
}

/** Mirrors ProviderService: approving needs a reason unless the AI returned LOW or MEDIUM (error 4256). */
export function needsApprovalReason(certificate: ProviderCertificateRecord) {
  return !(hasAiResult(certificate) && (certificate.aiRiskLevel === 'LOW' || certificate.aiRiskLevel === 'MEDIUM'))
}

export function warningCode(warning: CertificateAiWarning): WarningCode {
  return WARNING_CODES.find((code) => code === warning.code) ?? 'OTHER'
}

export function warningField(warning: CertificateAiWarning): CertificateField | undefined {
  return CERTIFICATE_FIELDS.find((field) => field === warning.field)
}

export function declaredValue(certificate: ProviderCertificateRecord, field: CertificateField) {
  switch (field) {
    case 'HOLDER_NAME':
      return certificate.caregiverName
    case 'CREDENTIAL_NUMBER':
      return certificate.credentialNumber
    case 'CERTIFICATE_NAME':
      return certificate.certificateName
    case 'ISSUED_BY':
      return certificate.issuedBy
    case 'ISSUED_DATE':
      return certificate.issuedDate
    case 'EXPIRY_DATE':
      return certificate.expiryDate
  }
}

export function extractedValue(certificate: ProviderCertificateRecord, field: CertificateField) {
  const extracted = certificate.aiExtracted
  if (!extracted) return undefined
  switch (field) {
    case 'HOLDER_NAME':
      return extracted.holderName
    case 'CREDENTIAL_NUMBER':
      return extracted.credentialNumber
    case 'CERTIFICATE_NAME':
      return extracted.certificateName
    case 'ISSUED_BY':
      return extracted.issuedBy
    case 'ISSUED_DATE':
      return extracted.issuedDate
    case 'EXPIRY_DATE':
      return extracted.expiryDate
  }
}

/** One row of the comparison table, read from the AI warnings (the backend decides what matches). */
export function fieldResult(certificate: ProviderCertificateRecord, field: CertificateField): FieldResult {
  const warnings = (certificate.aiWarnings ?? []).filter((warning) => warningField(warning) === field)
  if (warnings.some((warning) => warning.code === 'MISMATCH')) return 'mismatch'
  if (warnings.some((warning) => warning.code === 'NOT_FOUND')) return 'notFound'
  if (!declaredValue(certificate, field)) return 'notDeclared'
  return 'match'
}

export function isDateField(field: CertificateField) {
  return field === 'ISSUED_DATE' || field === 'EXPIRY_DATE'
}

const REVIEW_ERROR_CODES = [4251, 4253, 4254, 4255, 4256, 4257] as const
export type CertificateReviewErrorKey =
  `certificateReview.errors.e${(typeof REVIEW_ERROR_CODES)[number]}` | 'certificateReview.errors.generic'

/** A ProviderService certificate error as its translation key; unknown failures read as a generic message. */
export function certificateReviewErrorKey(error: unknown): CertificateReviewErrorKey {
  const code = REVIEW_ERROR_CODES.find((item) => item === apiErrorCode(error))
  return code ? `certificateReview.errors.e${code}` : 'certificateReview.errors.generic'
}
