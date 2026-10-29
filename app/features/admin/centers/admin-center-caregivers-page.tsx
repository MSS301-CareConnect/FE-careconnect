import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Link, useParams, useSearchParams } from 'react-router'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

import {
  fetchCaregiver,
  fetchCaregivers,
  fetchCenter,
  fetchCertificates,
  providerKeys,
  verifyCaregiver,
  verifyCertificate
} from '~/entities/provider/provider-api'

const key = 'admin.provider' as const
const statusKeys = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
// Certificates are reviewed in two steps: the center confirms, then the admin approves.
const certificateKeys = {
  PENDING: 'pending',
  CENTER_VERIFIED: 'centerVerified',
  ADMIN_VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const

function CaregiverReview({ id, centerId }: { id: string; centerId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [confirmReject, setConfirmReject] = useState<
    { type: 'caregiver' } | { type: 'certificate'; certificateId: string; version: number } | null
  >(null)
  const caregiver = useQuery({ queryKey: providerKeys.caregiver(id), queryFn: () => fetchCaregiver(id), retry: false })
  const certificates = useQuery({
    queryKey: providerKeys.certificates(id),
    queryFn: () => fetchCertificates(id),
    retry: false
  })
  const review = useMutation({
    mutationFn: (status: 'VERIFIED' | 'REJECTED') =>
      verifyCaregiver(id, { status, reason: reason.trim() || undefined, version: caregiver.data!.version }),
    onSuccess: async () => {
      setConfirmReject(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregiver(id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(centerId) })
    },
    onError: () => setConfirmReject(null)
  })
  const reviewCertificate = useMutation({
    mutationFn: ({ certificateId, approved, version }: { certificateId: string; approved: boolean; version: number }) =>
      verifyCertificate(certificateId, { approved, reason: reason.trim() || undefined, version }),
    onSuccess: async () => {
      setConfirmReject(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(id) })
    },
    onError: () => setConfirmReject(null)
  })
  if (caregiver.isPending) return <p role='status'>{t(`${key}.loading`)}</p>
  if (caregiver.isError)
    return (
      <div role='alert'>
        <p>{t(`${key}.caregiverLoadError`)}</p>
        <button className='text-primary underline' onClick={() => void caregiver.refetch()} type='button'>
          {t(`${key}.retry`)}
        </button>
      </div>
    )
  if (caregiver.data.centerId !== centerId) return <p role='alert'>{t(`${key}.caregiverLoadError`)}</p>
  return (
    <section className='space-y-5 rounded-xl bg-white p-6 shadow-xl'>
      <div>
        <h2 className='text-xl font-bold'>{caregiver.data.fullName}</h2>
      </div>
      <div className='flex flex-wrap items-center gap-3 text-sm'>
        <span className='flex items-center gap-2'>
          <strong>{t(`${key}.status`)}:</strong>
          <ProviderStatusBadge status={caregiver.data.caregiverStatus}>
            {t(`${key}.${statusKeys[caregiver.data.caregiverStatus]}`)}
          </ProviderStatusBadge>
        </span>
        <span className='flex items-center gap-2'>
          <strong>{t(`${key}.verification`)}:</strong>
          <ProviderStatusBadge status={caregiver.data.verificationStatus}>
            {t(`${key}.${verificationKeys[caregiver.data.verificationStatus]}`)}
          </ProviderStatusBadge>
        </span>
      </div>
      <label className='block text-sm'>
        {t(`${key}.reason`)}
        <input
          className='mt-1 w-full rounded-lg bg-surface-container-low p-3 outline-none focus:ring-2 focus:ring-primary'
          onChange={(event) => setReason(event.target.value)}
          value={reason}
        />
      </label>
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50'
          disabled={review.isPending}
          onClick={() => review.mutate('VERIFIED')}
          type='button'
        >
          {t(`${key}.verify`)}
        </button>
        <button
          className='rounded-lg border px-3 py-2 disabled:opacity-50'
          disabled={review.isPending}
          onClick={() => setConfirmReject({ type: 'caregiver' })}
          type='button'
        >
          {t(`${key}.reject`)}
        </button>
      </div>
      {review.isError ? <p role='alert'>{t(apiRequestErrorKey(review.error, `${key}.actionError`))}</p> : null}
      <div className='space-y-3 border-t pt-4'>
        <h3 className='font-semibold'>{t(`${key}.certificates`)}</h3>
        {certificates.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
        {certificates.isError ? (
          <div role='alert'>
            <p>{t(`${key}.certificateLoadError`)}</p>
            <button className='text-primary underline' onClick={() => void certificates.refetch()} type='button'>
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : null}
        {certificates.isSuccess && certificates.data.length === 0 ? <p>{t(`${key}.certificateEmpty`)}</p> : null}
        {certificates.isSuccess ? (
          <ul className='divide-y'>
            {certificates.data.map((certificate) => (
              <li className='flex flex-wrap items-center justify-between gap-3 py-3' key={certificate.id}>
                <div>
                  <strong>{certificate.certificateName}</strong>
                  <p className='mt-1 flex items-center gap-2 text-sm text-outline'>
                    <span>{certificate.issuedBy}</span>
                    <ProviderStatusBadge status={certificate.verificationStatus}>
                      {t(`${key}.${certificateKeys[certificate.verificationStatus]}`)}
                    </ProviderStatusBadge>
                  </p>
                </div>
                <div className='flex gap-2'>
                  {certificate.verificationStatus === 'PENDING' ? (
                    <span className='text-xs text-on-surface-variant'>{t(`${key}.awaitingCenter`)}</span>
                  ) : null}
                  <button
                    className='text-primary underline disabled:opacity-50'
                    disabled={reviewCertificate.isPending || certificate.verificationStatus !== 'CENTER_VERIFIED'}
                    onClick={() =>
                      reviewCertificate.mutate({
                        certificateId: certificate.id,
                        approved: true,
                        version: certificate.version
                      })
                    }
                    type='button'
                  >
                    {t(`${key}.verify`)}
                  </button>
                  <button
                    className='text-error underline disabled:opacity-50'
                    disabled={reviewCertificate.isPending}
                    onClick={() =>
                      setConfirmReject({
                        type: 'certificate',
                        certificateId: certificate.id,
                        version: certificate.version
                      })
                    }
                    type='button'
                  >
                    {t(`${key}.reject`)}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {reviewCertificate.isError ? (
          <p role='alert'>{t(apiRequestErrorKey(reviewCertificate.error, `${key}.actionError`))}</p>
        ) : null}
      </div>
      <ConfirmDialog
        cancelLabel={t(`${key}.cancel`)}
        confirmLabel={t(`${key}.reject`)}
        description={t(`${key}.confirmReject`)}
        loading={review.isPending || reviewCertificate.isPending}
        onClose={() => setConfirmReject(null)}
        onConfirm={() => {
          if (confirmReject?.type === 'caregiver') {
            review.mutate('REJECTED')
          } else if (confirmReject?.type === 'certificate') {
            reviewCertificate.mutate({
              certificateId: confirmReject.certificateId,
              approved: false,
              version: confirmReject.version
            })
          }
        }}
        open={Boolean(confirmReject)}
        title={t(`${key}.reject`)}
        tone='danger'
      />
    </section>
  )
}

export function AdminCenterCaregiversPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const selected = params.get('caregiver')
  const center = useQuery({
    queryKey: providerKeys.center(id),
    queryFn: () => fetchCenter(id),
    retry: false,
    enabled: Boolean(id)
  })
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(id), page],
    queryFn: () => fetchCaregivers(id, { page, size: 20 }),
    retry: false,
    enabled: Boolean(id)
  })
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      return next
    })
  }
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary'
        to='/admin/centers'
      >
        <Icon name='arrow_back' />
        {t(`${key}.backToCenters`)}
      </Link>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.caregiverTitle`)}</h1>
          {center.isSuccess ? <p className='mt-2 text-sm text-on-surface-variant'>{center.data.centerName}</p> : null}
        </div>
        <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
          {caregivers.data?.totalElements ?? 0}
        </span>
      </header>
      {center.isError ? <p role='alert'>{t(`${key}.centerLoadError`)}</p> : null}
      {caregivers.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {caregivers.isError ? (
        <div role='alert'>
          <p>{t(`${key}.caregiverLoadError`)}</p>
          <button className='text-primary underline' onClick={() => void caregivers.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {caregivers.isSuccess ? (
        <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
          {caregivers.data.items.length === 0 ? (
            <p className='p-5'>{t(`${key}.caregiverEmpty`)}</p>
          ) : (
            <ul className='divide-y divide-outline-variant/20'>
              {caregivers.data.items.map((person) => (
                <li
                  className='flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-surface-container-low/40'
                  key={person.id}
                >
                  <div className='flex items-center gap-3'>
                    <span className='flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-primary'>
                      <Icon name='person' />
                    </span>
                    <div>
                      <strong>{person.fullName}</strong>
                      <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-outline'>
                        <ProviderStatusBadge status={person.verificationStatus}>
                          {t(`${key}.${verificationKeys[person.verificationStatus]}`)}
                        </ProviderStatusBadge>
                        <ProviderStatusBadge status={person.caregiverStatus}>
                          {t(`${key}.${statusKeys[person.caregiverStatus]}`)}
                        </ProviderStatusBadge>
                      </div>
                    </div>
                  </div>
                  <button
                    className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary-container'
                    onClick={() => update('caregiver', person.id)}
                    type='button'
                  >
                    {t(`${key}.centerDetails`)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className='flex justify-between border-t p-4 text-sm'>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page === 0}
              onClick={() => update('page', String(page - 1))}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, caregivers.data.totalPages) })}</span>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page + 1 >= caregivers.data.totalPages}
              onClick={() => update('page', String(page + 1))}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        </section>
      ) : null}
      {selected ? (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-on-surface/50 p-4'>
          <div className='mx-auto my-10 max-w-2xl'>
            <button
              className='mb-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary'
              onClick={() => update('caregiver', '')}
              type='button'
            >
              {t(`${key}.close`)}
            </button>
            <CaregiverReview centerId={id} id={selected} key={selected} />
          </div>
        </div>
      ) : null}
    </main>
  )
}
