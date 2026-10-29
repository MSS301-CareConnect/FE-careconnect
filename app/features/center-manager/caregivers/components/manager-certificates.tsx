import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  fetchCertificates,
  fetchProviderMedia,
  providerKeys,
  verifyCertificateByCenter
} from '~/entities/provider/provider-api'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.provider' as const
const statusLabels = {
  PENDING: 'pending',
  CENTER_VERIFIED: 'centerVerified',
  ADMIN_VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const

function CertificateFiles({ certificateId }: { certificateId: string }) {
  const { t } = useTranslation()
  const media = useQuery({
    queryKey: providerKeys.media('CERTIFICATE', certificateId),
    queryFn: () => fetchProviderMedia('CERTIFICATE', certificateId),
    retry: false
  })

  if (media.isPending) return <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.loading')}</p>
  if (media.isError) return <p className='text-sm text-error'>{t('common.providerMedia.error')}</p>
  if (!media.data?.length) return <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.empty')}</p>

  return (
    <ul className='flex flex-wrap gap-2'>
      {media.data.map((file) => (
        <li key={file.mediaFileId}>
          {file.downloadUrl ? (
            <a
              className='inline-flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm font-medium text-primary hover:border-primary'
              href={file.downloadUrl}
              rel='noreferrer'
              target='_blank'
            >
              <Icon name='attach_file' />
              <span className='max-w-48 truncate'>{file.originalFileName || t('common.providerMedia.open')}</span>
              <Icon className='text-base' name='open_in_new' />
            </a>
          ) : (
            <span className='text-sm text-on-surface-variant'>{file.originalFileName || file.mediaFileType}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function ManagerCertificates({ caregiverId }: { caregiverId: string }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [rejecting, setRejecting] = useState<ProviderCertificateRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const certificates = useQuery({
    queryKey: providerKeys.certificates(caregiverId),
    queryFn: () => fetchCertificates(caregiverId),
    retry: false
  })
  const confirm = useMutation({
    mutationFn: ({ certificate, approved }: { certificate: ProviderCertificateRecord; approved: boolean }) =>
      verifyCertificateByCenter(certificate.id, {
        approved,
        reason: approved ? undefined : rejectReason.trim(),
        version: certificate.version
      }),
    onSuccess: async () => {
      setRejecting(null)
      setRejectReason('')
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
    }
  })

  return (
    <section className='rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-7'>
      <div className='flex items-start gap-3'>
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary'>
          <Icon name='workspace_premium' />
        </span>
        <div>
          <h2 className='text-lg font-bold'>{t(`${key}.certificatesTitle`)}</h2>
          <p className='mt-1 text-sm leading-6 text-on-surface-variant'>{t(`${key}.certificateSteps`)}</p>
        </div>
      </div>
      {certificates.isPending ? (
        <p className='mt-6' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {certificates.isError ? (
        <div className='mt-6' role='alert'>
          <p>{t(`${key}.certificatesError`)}</p>
          <button
            className='mt-2 font-semibold text-primary underline'
            onClick={() => void certificates.refetch()}
            type='button'
          >
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {certificates.isSuccess && certificates.data.length === 0 ? (
        <p className='mt-6 rounded-xl bg-surface-container-low p-5 text-sm text-on-surface-variant'>
          {t(`${key}.certificatesEmpty`)}
        </p>
      ) : null}
      {confirm.isError ? (
        <p className='mt-5 text-sm text-error' role='alert'>
          {t(
            apiErrorStatus(confirm.error) === 409
              ? `${key}.certificateConfirmError`
              : apiRequestErrorKey(confirm.error, `${key}.certificateActionError`)
          )}
        </p>
      ) : null}
      {certificates.isSuccess ? (
        <ul className='mt-5 divide-y divide-outline-variant/30'>
          {certificates.data.map((certificate) => (
            <li className='py-5 first:pt-2 last:pb-0' key={certificate.id}>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <h3 className='font-semibold'>{certificate.certificateName}</h3>
                  <p className='mt-1 text-sm text-on-surface-variant'>{certificate.issuedBy}</p>
                  {certificate.issuedDate || certificate.expiryDate ? (
                    <p className='mt-1 text-xs text-on-surface-variant'>
                      {certificate.issuedDate ? formatProviderDate(certificate.issuedDate, i18n.language) : '—'}
                      {' – '}
                      {certificate.expiryDate ? formatProviderDate(certificate.expiryDate, i18n.language) : '—'}
                    </p>
                  ) : null}
                </div>
                <ProviderStatusBadge
                  label={t(`${key}.${statusLabels[certificate.verificationStatus]}`)}
                  status={certificate.verificationStatus}
                />
              </div>
              <div className='mt-4'>
                <CertificateFiles certificateId={certificate.id} />
              </div>
              {certificate.verificationStatus === 'PENDING' ? (
                <div className='mt-4 flex flex-wrap gap-2'>
                  <button
                    className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50'
                    disabled={confirm.isPending}
                    onClick={() => confirm.mutate({ certificate, approved: true })}
                    type='button'
                  >
                    {t(`${key}.confirmCertificate`)}
                  </button>
                  <button
                    className='rounded-lg border border-outline-variant/60 px-3 py-2 text-sm font-semibold text-on-surface disabled:opacity-50'
                    disabled={confirm.isPending}
                    onClick={() => setRejecting(certificate)}
                    type='button'
                  >
                    {t(`${key}.rejectCertificate`)}
                  </button>
                </div>
              ) : null}
              {rejecting?.id === certificate.id ? (
                <div className='mt-4 flex flex-wrap items-end gap-2'>
                  <label className='flex min-w-48 flex-1 flex-col text-sm font-medium'>
                    {t(`${key}.rejectCertificateReason`)}
                    <input
                      className='mt-1 rounded-lg border border-outline-variant px-3 py-2'
                      maxLength={500}
                      onChange={(event) => setRejectReason(event.target.value)}
                      value={rejectReason}
                    />
                  </label>
                  <button
                    className='rounded-lg border border-error px-3 py-2 text-sm font-semibold text-error disabled:opacity-50'
                    disabled={confirm.isPending || !rejectReason.trim()}
                    onClick={() => confirm.mutate({ certificate, approved: false })}
                    type='button'
                  >
                    {t(`${key}.rejectCertificate`)}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
