import { useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toastSuccess } from '~/shared/ui/app-toast'

import { ProviderMediaPanel } from '~/entities/provider/provider-media-panel'
import { providerKeys, removeCertificate } from '~/entities/provider/provider-api'
import { apiErrorCode, apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { CaregiverEmpty, CaregiverError, cgCard } from '../../ui/caregiver-page'
import { useClientPage } from '../../ui/use-client-page'
import { CertificateEditForm } from './certificate-edit-form'
import { CertificateForm } from './certificate-form'

const CERTIFICATES_PER_PAGE = 6
const DAY_MS = 24 * 60 * 60 * 1000
const EXPIRING_MS = 30 * DAY_MS

type CertificateState = ProviderCertificateRecord['verificationStatus'] | 'expired' | 'expiring'

const TONE: Record<CertificateState, StatusTone> = {
  PENDING: 'warning',
  CENTER_VERIFIED: 'info',
  ADMIN_VERIFIED: 'success',
  REJECTED: 'error',
  expired: 'error',
  expiring: 'warning'
}

/** Expiry wins over the review state: an expired verified certificate no longer counts. */
export function certificateState(certificate: ProviderCertificateRecord, now: number): CertificateState {
  if (certificate.expiryDate) {
    const left = new Date(`${certificate.expiryDate}T23:59:59+07:00`).getTime() - now
    if (left < 0) return 'expired'
    if (left < EXPIRING_MS && certificate.verificationStatus !== 'REJECTED') return 'expiring'
  }
  return certificate.verificationStatus
}

/** ProviderService lets a caregiver delete only a certificate not yet confirmed or already rejected (2026-11-10). */
function canDelete(certificate: ProviderCertificateRecord) {
  return certificate.verificationStatus === 'PENDING' || certificate.verificationStatus === 'REJECTED'
}

/** Certificates as a grid of cards with their review state, files in a drawer, add, edit and delete. */
export function CertificatesTab({
  caregiverId,
  certificates,
  now
}: {
  caregiverId: string
  certificates: UseQueryResult<ProviderCertificateRecord[]>
  now: number
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [viewing, setViewing] = useState<ProviderCertificateRecord | null>(null)
  const [deleting, setDeleting] = useState<ProviderCertificateRecord | null>(null)
  const [editing, setEditing] = useState<ProviderCertificateRecord | null>(null)
  // ProviderService returns every certificate at once; six cards a page keep the tab short.
  const paged = useClientPage(certificates.data ?? [], CERTIFICATES_PER_PAGE)
  const remove = useMutation({
    mutationFn: (certificate: ProviderCertificateRecord) => removeCertificate(certificate.id, certificate.version),
    onSuccess: async () => {
      toastSuccess(t('caregiver.me.certificates.deleted'))
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
    },
    // 4253: the center confirmed it meanwhile; refresh so the card shows its new state without the delete action.
    onError: async (error) => {
      if (apiErrorCode(error) === 4253) {
        await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
      }
    }
  })

  function openForm() {
    setFormKey((value) => value + 1)
    setAdding(true)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='max-w-xl text-sm text-on-surface-variant'>{t('caregiver.me.certificates.intro')}</p>
        <Button leftIcon={<Icon className='text-lg' name='add' />} onClick={openForm}>
          {t('caregiver.me.certificates.add')}
        </Button>
      </div>

      {certificates.isPending ? (
        <SkeletonGroup className='grid gap-3 sm:grid-cols-2' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </SkeletonGroup>
      ) : null}
      {certificates.isError ? (
        <CaregiverError
          message={t('caregiver.me.certificates.loadError')}
          onRetry={() => void certificates.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      ) : null}
      {certificates.isSuccess && certificates.data.length === 0 ? (
        <CaregiverEmpty
          action={
            <Button leftIcon={<Icon className='text-lg' name='add' />} onClick={openForm} variant='outline'>
              {t('caregiver.me.certificates.add')}
            </Button>
          }
          description={t('caregiver.me.certificates.emptyHint')}
          icon='workspace_premium'
          title={t('caregiver.me.certificates.empty')}
        />
      ) : null}
      {certificates.isSuccess && certificates.data.length > 0 ? (
        <ul className='cg-stagger grid gap-3 sm:grid-cols-2' key={paged.page}>
          {paged.items.map((certificate) => {
            const state = certificateState(certificate, now)
            return (
              <li className={`${cgCard} flex flex-col gap-3 p-4`} key={certificate.id}>
                <div className='flex items-start gap-3'>
                  <span className='grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-primary'>
                    <Icon className='text-2xl' name='workspace_premium' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <h3 className='font-semibold break-words text-on-surface'>{certificate.certificateName}</h3>
                    <p className='text-sm break-words text-on-surface-variant'>
                      {t('caregiver.me.certificates.issuedBy', { issuer: certificate.issuedBy })}
                    </p>
                  </div>
                </div>
                <StatusBadge className='self-start' dot tone={TONE[state]}>
                  {t(`caregiver.me.certificates.status.${state}`)}
                </StatusBadge>
                <p className='flex flex-wrap gap-x-3 gap-y-1 text-sm text-on-surface-variant tabular-nums'>
                  {certificate.credentialNumber ? (
                    <span>{t('caregiver.me.certificates.number', { number: certificate.credentialNumber })}</span>
                  ) : null}
                  {certificate.issuedDate ? (
                    <span>{t('caregiver.me.certificates.issued', { date: format.date(certificate.issuedDate) })}</span>
                  ) : null}
                  {certificate.expiryDate ? (
                    <span className={state === 'expired' ? 'font-semibold text-error' : ''}>
                      {t('caregiver.me.certificates.expires', { date: format.date(certificate.expiryDate) })}
                    </span>
                  ) : null}
                </p>
                {certificate.verificationStatus === 'REJECTED' && certificate.verificationReason ? (
                  <p className='text-sm text-error'>
                    {t('caregiver.me.certificates.rejectedReason', { reason: certificate.verificationReason })}
                  </p>
                ) : null}
                <div className='mt-auto flex gap-2 border-t border-outline-variant pt-3'>
                  <Button
                    className='flex-1'
                    leftIcon={<Icon className='text-lg' name='folder_open' />}
                    onClick={() => setViewing(certificate)}
                    size='sm'
                    variant='outline'
                  >
                    {t('caregiver.me.certificates.files')}
                  </Button>
                  <Button
                    aria-label={`${t('caregiver.me.certificates.edit')} ${certificate.certificateName}`}
                    leftIcon={<Icon className='text-lg' name='edit' />}
                    onClick={() => setEditing(certificate)}
                    size='sm'
                    variant='ghost'
                  >
                    {t('caregiver.me.certificates.edit')}
                  </Button>
                  {canDelete(certificate) ? (
                    <Button
                      aria-label={`${t('caregiver.me.certificates.delete')} ${certificate.certificateName}`}
                      className='text-error'
                      leftIcon={<Icon className='text-lg' name='delete' />}
                      onClick={() => {
                        remove.reset()
                        setDeleting(certificate)
                      }}
                      size='sm'
                      variant='ghost'
                    >
                      {t('caregiver.me.certificates.delete')}
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
      {certificates.isSuccess ? (
        <Pagination
          ariaLabel={t('caregiver.me.certificates.pagination')}
          onPageChange={paged.setPage}
          page={paged.page}
          totalPages={paged.totalPages}
        />
      ) : null}

      {adding ? (
        <CertificateForm
          caregiverId={caregiverId}
          key={formKey}
          onClose={() => setAdding(false)}
          onCreated={(id) => {
            setAdding(false)
            const created = certificates.data?.find((item) => item.id === id)
            if (created) setViewing(created)
          }}
          open
        />
      ) : null}

      {viewing ? (
        <Modal
          onClose={() => setViewing(null)}
          open
          size='lg'
          title={t('caregiver.me.certificates.filesTitle', { name: viewing.certificateName })}
        >
          {viewing.verificationStatus !== 'PENDING' ? (
            <p className='mb-4 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-container px-4 py-3 text-sm leading-5 text-on-warning-container'>
              <Icon className='mt-0.5 shrink-0 text-lg' name='info' />
              <span>{t('caregiver.me.certificates.filesResetNotice')}</span>
            </p>
          ) : null}
          <ProviderMediaPanel embedded ownerId={viewing.id} ownerType='CERTIFICATE' />
        </Modal>
      ) : null}

      {editing ? (
        <CertificateEditForm
          caregiverId={caregiverId}
          certificate={editing}
          key={editing.id}
          onClose={() => setEditing(null)}
          onManagePhotos={() => {
            setEditing(null)
            setViewing(editing)
          }}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel={t('caregiver.me.certificates.delete')}
        description={
          deleting ? t('caregiver.me.certificates.deleteDescription', { name: deleting.certificateName }) : undefined
        }
        error={
          remove.isError
            ? t(
                apiErrorCode(remove.error) === 4253
                  ? 'caregiver.me.certificates.deleteBlocked'
                  : apiRequestErrorKey(remove.error, 'caregiver.provider.actionError')
              )
            : undefined
        }
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting)
        }}
        open={deleting !== null}
        title={t('caregiver.me.certificates.deleteTitle')}
        tone='danger'
      />
    </div>
  )
}
