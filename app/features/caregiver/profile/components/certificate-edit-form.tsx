import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toastSuccess } from '~/shared/ui/app-toast'

import { certificateReviewErrorKey } from '~/entities/provider/certificate-ai'
import { fetchProviderMedia, providerKeys, saveCertificate } from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'

import {
  CertificateDetailsFields,
  certificateDetailsChanged,
  certificateDetailsOf,
  certificateRequestOf,
  checkCertificateDetails,
  type CertificateDetails
} from './certificate-details-fields'

/**
 * Edit what a caregiver declared about a certificate (`PUT /certificates/{id}` with its version). ProviderService
 * sends any changed certificate back to the center and drops the AI result, so a certificate past the first step
 * says so up front and asks once more before saving. Photos keep their own manager (the files drawer of the tab);
 * the dialog shows how many are attached and opens that manager.
 */
export function CertificateEditForm({
  caregiverId,
  certificate,
  onClose,
  onManagePhotos
}: {
  caregiverId: string
  certificate: ProviderCertificateRecord
  onClose: () => void
  onManagePhotos: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const original = certificateDetailsOf(certificate)
  const [details, setDetails] = useState<CertificateDetails>(original)
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const resetsReview = certificate.verificationStatus !== 'PENDING'
  const changed = certificateDetailsChanged(original, details)
  const photos = useQuery({
    queryKey: providerKeys.media('CERTIFICATE', certificate.id),
    queryFn: () => fetchProviderMedia('CERTIFICATE', certificate.id)
  })

  const save = useMutation({
    mutationFn: () => saveCertificate(certificate.id, certificateRequestOf(details, certificate.version)),
    onSuccess: async () => {
      toastSuccess(
        t(resetsReview ? 'caregiver.me.certificates.editForm.savedReset' : 'caregiver.me.certificates.editForm.saved')
      )
      setConfirming(false)
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
      onClose()
    },
    onError: async () => {
      setConfirming(false)
      // A version conflict or a deleted certificate is fixed by reading the list again.
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
    }
  })

  function submit() {
    setSubmitted(true)
    if (!checkCertificateDetails(details).valid || !changed) return
    if (resetsReview) setConfirming(true)
    else save.mutate()
  }

  const reviewKey = save.isError ? certificateReviewErrorKey(save.error) : null
  const errorKey =
    reviewKey && reviewKey !== 'certificateReview.errors.generic'
      ? reviewKey
      : apiRequestErrorKey(save.error, 'caregiver.provider.actionError')
  const photoCount = photos.data?.length ?? 0

  return (
    <>
      <Modal
        description={t('caregiver.me.certificates.editForm.description')}
        dismissOnBackdrop={false}
        footer={
          <>
            <Button disabled={save.isPending} onClick={onClose} variant='outline'>
              {t('caregiver.ui.actions.cancel')}
            </Button>
            <Button disabled={!changed} loading={save.isPending} onClick={submit}>
              {t('caregiver.me.certificates.editForm.save')}
            </Button>
          </>
        }
        onClose={onClose}
        open
        size='lg'
        title={t('caregiver.me.certificates.editForm.title')}
      >
        <form
          className='flex flex-col gap-5'
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          {resetsReview ? (
            <p className='flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-container px-4 py-3 text-sm leading-5 text-on-warning-container'>
              <Icon className='mt-0.5 shrink-0 text-lg' name='info' />
              <span>
                {t(
                  certificate.verificationStatus === 'ADMIN_VERIFIED'
                    ? 'caregiver.me.certificates.editForm.resetNoticeVerified'
                    : 'caregiver.me.certificates.editForm.resetNotice'
                )}
              </span>
            </p>
          ) : null}

          <CertificateDetailsFields
            disabled={save.isPending}
            onChange={setDetails}
            showErrors={submitted}
            value={details}
          />

          <div className='flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant px-4 py-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-primary'>
              <Icon name='photo_library' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-on-surface'>{t('caregiver.me.certificates.editForm.photos')}</p>
              <p
                className={`text-sm ${photos.isSuccess && photoCount === 0 ? 'text-error' : 'text-on-surface-variant'}`}
              >
                {photos.isPending
                  ? t('caregiver.me.certificates.editForm.photosLoading')
                  : photoCount === 0
                    ? t('caregiver.me.certificates.editForm.noPhotos')
                    : t('caregiver.me.certificates.editForm.photoCount', { count: photoCount })}
              </p>
            </div>
            <Button
              disabled={save.isPending}
              leftIcon={<Icon className='text-lg' name='folder_open' />}
              onClick={onManagePhotos}
              size='sm'
              variant='outline'
            >
              {t('caregiver.me.certificates.editForm.managePhotos')}
            </Button>
          </div>

          {save.isError ? <FormAlert tone='error'>{t(errorKey)}</FormAlert> : null}
          <button aria-hidden='true' className='sr-only' tabIndex={-1} type='submit'>
            {t('caregiver.me.certificates.editForm.save')}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        confirmLabel={t('caregiver.me.certificates.editForm.confirm')}
        description={t('caregiver.me.certificates.editForm.confirmDescription', { name: certificate.certificateName })}
        loading={save.isPending}
        onClose={() => setConfirming(false)}
        onConfirm={() => save.mutate()}
        open={confirming}
        title={t('caregiver.me.certificates.editForm.confirmTitle')}
        tone='primary'
      />
    </>
  )
}
