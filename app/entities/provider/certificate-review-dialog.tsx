import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal, ModalColumns } from '~/shared/ui/modal'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import {
  CERTIFICATE_FIELDS,
  certificateReviewErrorKey,
  declaredValue,
  extractedValue,
  fieldResult,
  hasAiResult,
  isAiChecking,
  isDateField,
  needsApprovalReason,
  warningCode,
  warningField,
  type CertificateField,
  type FieldResult
} from './certificate-ai'
import { CertificateAiBadge } from './certificate-ai-badge'
import { CertificateFiles } from './certificate-files'
import { providerKeys, startCertificateAiCheck, verifyCertificate } from './provider-api'

const RESULT_TONES: Record<FieldResult, StatusTone> = {
  match: 'success',
  mismatch: 'danger',
  notFound: 'warning',
  notDeclared: 'neutral'
}

type Decision = 'approve' | 'reject'

/**
 * Step 5 of the certificate review (ADMIN, 2026-11-09): the photos next to what the caregiver declared and what the
 * AI read, the AI risk and warnings, the center confirmation, and the decision. Approving without a LOW / MEDIUM AI
 * result and every rejection need a reason (ProviderService 4256). The AI check can be run again while the
 * certificate waits for the admin.
 */
export function CertificateReviewDialog({
  certificate,
  onClose
}: {
  certificate: ProviderCertificateRecord
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { date, dateTime } = useFormat()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const waiting = certificate.verificationStatus === 'CENTER_VERIFIED'
  const verified = certificate.verificationStatus === 'ADMIN_VERIFIED'
  const checking = isAiChecking(certificate)

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: providerKeys.certificateAudit }),
      queryClient.invalidateQueries({ queryKey: providerKeys.certificates(certificate.caregiverId) })
    ])
  }

  const decide = useMutation({
    mutationFn: (decision: Decision) =>
      verifyCertificate(certificate.id, {
        approved: decision === 'approve',
        reason: reason.trim() || undefined,
        version: certificate.version
      }),
    onSuccess: async (_saved, decision) => {
      toastSuccess(
        t(decision === 'approve' ? 'certificateReview.toast.approved' : 'certificateReview.toast.rejected', {
          name: certificate.certificateName
        })
      )
      await refresh()
      onClose()
    }
  })
  const rerun = useMutation({
    mutationFn: () => startCertificateAiCheck(certificate.id),
    onSuccess: async () => {
      toastSuccess(t('certificateReview.toast.aiQueued', { name: certificate.certificateName }))
      await refresh()
    }
  })
  const busy = decide.isPending || rerun.isPending

  function submit(decision: Decision) {
    if (!reason.trim()) {
      if (decision === 'reject') return setReasonError(t('certificateReview.dialog.reasonRequiredReject'))
      if (needsApprovalReason(certificate)) return setReasonError(t('certificateReview.dialog.reasonRequiredRisk'))
    }
    setReasonError(null)
    decide.mutate(decision)
  }

  function show(field: CertificateField, value: string | undefined) {
    if (!value) return '—'
    return isDateField(field) ? date(value) : value
  }

  const footer = (
    <>
      <Button disabled={busy} onClick={onClose} variant='outline'>
        {t('certificateReview.dialog.close')}
      </Button>
      {waiting || verified ? (
        <Button
          disabled={busy}
          loading={decide.isPending && decide.variables === 'reject'}
          onClick={() => submit('reject')}
          variant='danger'
        >
          {verified ? t('certificateReview.dialog.revoke') : t('certificateReview.dialog.reject')}
        </Button>
      ) : null}
      {waiting ? (
        <Button
          disabled={busy}
          loading={decide.isPending && decide.variables === 'approve'}
          onClick={() => submit('approve')}
        >
          {t('certificateReview.dialog.approve')}
        </Button>
      ) : null}
    </>
  )

  const side = (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-on-surface'>{t('certificateReview.dialog.photos')}</h3>
        <CertificateFiles certificateId={certificate.id} large />
      </section>
      <dl className='space-y-2 rounded-2xl bg-surface-container-low p-4 text-sm'>
        <div className='flex justify-between gap-3'>
          <dt className='text-on-surface-variant'>{t('certificateReview.dialog.caregiver')}</dt>
          <dd className='text-right font-semibold text-on-surface'>{certificate.caregiverName ?? '—'}</dd>
        </div>
        <div className='flex justify-between gap-3'>
          <dt className='text-on-surface-variant'>{t('certificateReview.dialog.center')}</dt>
          <dd className='text-right font-semibold text-on-surface'>{certificate.centerName ?? '—'}</dd>
        </div>
      </dl>
      {certificate.centerVerifiedAt ? (
        <p className='text-xs text-on-surface-variant'>
          {t('certificateReview.dialog.centerConfirmedAt', { time: dateTime(certificate.centerVerifiedAt) })}
        </p>
      ) : null}
      {certificate.centerVerificationReason ? (
        <p className='text-xs text-on-surface-variant'>
          {t('certificateReview.dialog.centerNote', { note: certificate.centerVerificationReason })}
        </p>
      ) : null}
    </div>
  )

  return (
    <Modal
      description={[certificate.caregiverName, certificate.centerName].filter(Boolean).join(' · ')}
      dismissOnBackdrop={false}
      footer={footer}
      onClose={onClose}
      open
      size='2xl'
      title={`${t('certificateReview.dialog.title')}: ${certificate.certificateName}`}
    >
      <ModalColumns side={side} sideClassName='lg:w-96'>
        <div className='space-y-5'>
          <section className='space-y-2 rounded-2xl border border-outline-variant/60 p-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CertificateAiBadge certificate={certificate} />
              {waiting && !checking ? (
                <Button
                  disabled={busy}
                  loading={rerun.isPending}
                  onClick={() => rerun.mutate()}
                  size='sm'
                  variant='outline'
                >
                  <Icon className='text-base' name='refresh' />
                  {t('certificateReview.dialog.rerun')}
                </Button>
              ) : null}
            </div>
            {hasAiResult(certificate) && certificate.aiRiskLevel ? (
              <p className='text-sm text-on-surface'>{t(`certificateReview.riskHints.${certificate.aiRiskLevel}`)}</p>
            ) : null}
            {checking ? (
              <p className='text-sm text-on-surface-variant'>{t('certificateReview.dialog.checking')}</p>
            ) : null}
            {certificate.aiCheckStatus === 'FAILED' ? (
              <p className='text-sm text-error'>{t('certificateReview.dialog.failed')}</p>
            ) : null}
            {!certificate.aiCheckStatus ? (
              <p className='text-sm text-on-surface-variant'>{t('certificateReview.dialog.notChecked')}</p>
            ) : null}
            {certificate.aiCheckedAt ? (
              <p className='text-xs text-on-surface-variant'>
                {t('certificateReview.dialog.aiCheckedAt', { time: dateTime(certificate.aiCheckedAt) })}
              </p>
            ) : null}
            <p className='text-xs text-on-surface-variant'>{t('certificateReview.dialog.advisory')}</p>
          </section>

          <section className='space-y-2'>
            <h3 className='text-sm font-semibold text-on-surface'>{t('certificateReview.dialog.comparison')}</h3>
            <div className='overflow-x-auto rounded-2xl border border-outline-variant/60'>
              <table className='w-full min-w-[560px] text-left text-sm'>
                <thead className='bg-surface-container-low text-xs text-on-surface-variant'>
                  <tr>
                    <th className='px-3 py-2 font-semibold' scope='col'>
                      {t('certificateReview.dialog.field')}
                    </th>
                    <th className='px-3 py-2 font-semibold' scope='col'>
                      {t('certificateReview.dialog.declared')}
                    </th>
                    <th className='px-3 py-2 font-semibold' scope='col'>
                      {t('certificateReview.dialog.extracted')}
                    </th>
                    <th className='px-3 py-2 font-semibold' scope='col'>
                      {t('certificateReview.dialog.result')}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/60'>
                  {CERTIFICATE_FIELDS.map((field) => {
                    const result = hasAiResult(certificate) ? fieldResult(certificate, field) : null
                    return (
                      <tr key={field}>
                        <th className='px-3 py-2 font-medium text-on-surface-variant' scope='row'>
                          {t(`certificateReview.fields.${field}`)}
                        </th>
                        <td className='px-3 py-2 text-on-surface'>{show(field, declaredValue(certificate, field))}</td>
                        <td className='px-3 py-2 text-on-surface'>{show(field, extractedValue(certificate, field))}</td>
                        <td className='px-3 py-2'>
                          {result ? (
                            <StatusBadge tone={RESULT_TONES[result]}>
                              {t(`certificateReview.results.${result}`)}
                            </StatusBadge>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {certificate.aiCheckStatus === 'COMPLETED' ? (
            <section className='space-y-2'>
              <h3 className='text-sm font-semibold text-on-surface'>{t('certificateReview.dialog.warningsTitle')}</h3>
              {(certificate.aiWarnings ?? []).length === 0 ? (
                <p className='text-sm text-on-surface-variant'>{t('certificateReview.dialog.noWarnings')}</p>
              ) : (
                <ul className='space-y-1.5 text-sm'>
                  {(certificate.aiWarnings ?? []).map((warning, index) => {
                    const field = warningField(warning)
                    return (
                      <li className='flex gap-2 text-on-surface' key={`${warning.code}-${warning.field ?? index}`}>
                        <Icon className='mt-0.5 text-base text-warning' name='warning' />
                        <span>
                          {t(`certificateReview.warnings.${warningCode(warning)}`, {
                            field: field ? t(`certificateReview.fields.${field}`) : ''
                          })}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {waiting || verified ? (
            <FormField
              error={reasonError}
              hint={t('certificateReview.dialog.reasonHint')}
              label={t('certificateReview.dialog.reason')}
            >
              {(control) => (
                <Textarea
                  {...control}
                  maxLength={500}
                  onChange={(event) => {
                    setReason(event.target.value)
                    setReasonError(null)
                  }}
                  rows={3}
                  value={reason}
                />
              )}
            </FormField>
          ) : (
            <p className='text-sm text-on-surface-variant'>
              {t('certificateReview.dialog.alreadyDecided', {
                status: t(`certificateReview.statuses.${certificate.verificationStatus}`)
              })}
            </p>
          )}

          {decide.isError || rerun.isError ? (
            <FormAlert tone='error'>{t(certificateReviewErrorKey(decide.error ?? rerun.error))}</FormAlert>
          ) : null}
        </div>
      </ModalColumns>
    </Modal>
  )
}
