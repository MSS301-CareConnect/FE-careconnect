import { useTranslation } from 'react-i18next'

import type { CertificateRequest, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { DatePicker } from '~/shared/ui/date-picker'

export const certificateInputClass =
  'min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-[15px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 aria-invalid:border-error disabled:opacity-60'
export const certificateLabelClass = 'mb-1 block text-sm font-medium text-on-surface'

/** What the caregiver declares about a certificate, as typed (dates as yyyy-mm-dd, empty when not given). */
export interface CertificateDetails {
  name: string
  issuer: string
  number: string
  issuedDate: string
  expiryDate: string
}

export const EMPTY_CERTIFICATE_DETAILS: CertificateDetails = {
  name: '',
  issuer: '',
  number: '',
  issuedDate: '',
  expiryDate: ''
}

export function certificateDetailsOf(certificate: ProviderCertificateRecord): CertificateDetails {
  return {
    name: certificate.certificateName,
    issuer: certificate.issuedBy,
    number: certificate.credentialNumber ?? '',
    issuedDate: certificate.issuedDate ?? '',
    expiryDate: certificate.expiryDate ?? ''
  }
}

/** The request body ProviderService expects; blank optional values are left out rather than sent empty. */
export function certificateRequestOf(details: CertificateDetails, version?: number): CertificateRequest {
  return {
    certificateName: details.name.trim(),
    issuedBy: details.issuer.trim(),
    credentialNumber: details.number.trim() || undefined,
    issuedDate: details.issuedDate || undefined,
    expiryDate: details.expiryDate || undefined,
    ...(version === undefined ? {} : { version })
  }
}

export function checkCertificateDetails(details: CertificateDetails) {
  const nameMissing = !details.name.trim()
  const issuerMissing = !details.issuer.trim()
  const datesWrong = Boolean(details.issuedDate && details.expiryDate && details.expiryDate <= details.issuedDate)
  return { nameMissing, issuerMissing, datesWrong, valid: !nameMissing && !issuerMissing && !datesWrong }
}

/** True when saving would change what ProviderService stores (trimmed text, same dates). */
export function certificateDetailsChanged(before: CertificateDetails, after: CertificateDetails) {
  return (Object.keys(before) as (keyof CertificateDetails)[]).some(
    (field) => before[field].trim() !== after[field].trim()
  )
}

/**
 * Name, issuer, number and the two dates of a certificate, shared by the add and edit dialogs. Required fields report
 * under their input once the form was submitted; a wrong date order reports at once.
 */
export function CertificateDetailsFields({
  value,
  onChange,
  showErrors,
  disabled = false
}: {
  value: CertificateDetails
  onChange: (next: CertificateDetails) => void
  showErrors: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const { nameMissing, issuerMissing, datesWrong } = checkCertificateDetails(value)
  const set = (field: keyof CertificateDetails) => (next: string) => onChange({ ...value, [field]: next })

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <label className={certificateLabelClass} htmlFor='certificate-name'>
          {t('caregiver.me.certificates.form.name')}
        </label>
        <input
          aria-describedby={showErrors && nameMissing ? 'certificate-name-error' : undefined}
          aria-invalid={showErrors && nameMissing}
          className={certificateInputClass}
          disabled={disabled}
          id='certificate-name'
          maxLength={255}
          onChange={(event) => set('name')(event.target.value)}
          value={value.name}
        />
        {showErrors && nameMissing ? (
          <p className='mt-1 text-sm text-error' id='certificate-name-error'>
            {t('caregiver.me.certificates.form.required')}
          </p>
        ) : null}
      </div>
      <div>
        <label className={certificateLabelClass} htmlFor='certificate-issuer'>
          {t('caregiver.me.certificates.form.issuer')}
        </label>
        <input
          aria-describedby={showErrors && issuerMissing ? 'certificate-issuer-error' : undefined}
          aria-invalid={showErrors && issuerMissing}
          className={certificateInputClass}
          disabled={disabled}
          id='certificate-issuer'
          maxLength={255}
          onChange={(event) => set('issuer')(event.target.value)}
          value={value.issuer}
        />
        {showErrors && issuerMissing ? (
          <p className='mt-1 text-sm text-error' id='certificate-issuer-error'>
            {t('caregiver.me.certificates.form.required')}
          </p>
        ) : null}
      </div>
      <div>
        <label className={certificateLabelClass} htmlFor='certificate-number'>
          {t('caregiver.me.certificates.form.number')}
        </label>
        <input
          className={certificateInputClass}
          disabled={disabled}
          id='certificate-number'
          maxLength={100}
          onChange={(event) => set('number')(event.target.value)}
          value={value.number}
        />
      </div>
      <div className='grid gap-3 sm:grid-cols-2'>
        <div>
          <label className={certificateLabelClass} htmlFor='certificate-issued'>
            {t('caregiver.me.certificates.form.issuedDate')}
          </label>
          <DatePicker id='certificate-issued' onChange={set('issuedDate')} value={value.issuedDate} />
        </div>
        <div>
          <label className={certificateLabelClass} htmlFor='certificate-expiry'>
            {t('caregiver.me.certificates.form.expiryDate')}
          </label>
          <DatePicker
            aria-describedby={datesWrong ? 'certificate-dates-error' : undefined}
            aria-invalid={datesWrong}
            id='certificate-expiry'
            onChange={set('expiryDate')}
            value={value.expiryDate}
          />
        </div>
        {datesWrong ? (
          <p className='text-sm text-error sm:col-span-2' id='certificate-dates-error'>
            {t('caregiver.me.certificates.form.expiryBeforeIssue')}
          </p>
        ) : null}
      </div>
    </div>
  )
}
