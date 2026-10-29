import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  createCertificate,
  fetchMyCaregiverProfile,
  fetchCertificates,
  fetchProviderMedia,
  providerKeys,
  uploadMedia
} from '~/entities/provider/provider-api'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { ProviderMediaPanel, validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const key = 'caregiver.provider' as const
const verificationStatusKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const

export function CaregiverProviderProfilePage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [certificateName, setCertificateName] = useState('')
  const [issuedBy, setIssuedBy] = useState('')
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [certificateFileError, setCertificateFileError] = useState<'type' | 'size' | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [pendingCertificateId, setPendingCertificateId] = useState<string | null>(null)
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null)
  const [certificateSuccess, setCertificateSuccess] = useState(false)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const avatarMedia = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', profile.data?.id ?? ''),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  const certificates = useQuery({
    queryKey: providerKeys.certificates(profile.data?.id ?? ''),
    queryFn: () => fetchCertificates(profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  const create = useMutation({
    mutationFn: async () => {
      const certificateId =
        pendingCertificateId ??
        (
          await createCertificate(profile.data!.id, {
            certificateName: certificateName.trim(),
            issuedBy: issuedBy.trim()
          })
        ).id
      setPendingCertificateId(certificateId)
      try {
        await uploadMedia('CERTIFICATE', certificateId, [certificateFile!])
      } catch (error) {
        await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(profile.data!.id) })
        throw error
      }
      return certificateId
    },
    onSuccess: async (certificateId) => {
      setCertificateName('')
      setIssuedBy('')
      setCertificateFile(null)
      setCertificateFileError(null)
      setFileInputKey((current) => current + 1)
      setPendingCertificateId(null)
      setSelectedCertificateId(certificateId)
      setCertificateSuccess(true)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.certificates(profile.data!.id) }),
        queryClient.invalidateQueries({ queryKey: providerKeys.media('CERTIFICATE', certificateId) })
      ])
    }
  })
  useDocumentTitle(t(`${key}.profileTitle`))
  return (
    <main className='caregiver-print-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('caregiver.profile.title')}</h1>
          <p className='mt-3 text-sm text-on-surface-variant'>{t('caregiver.profile.subtitle')}</p>
        </div>
        <button
          className='flex items-center gap-2 rounded-xl border border-primary/25 bg-white px-4 py-3 text-sm font-bold text-primary print:hidden'
          onClick={() => window.print()}
          type='button'
        >
          <Icon name='print' />
          {t('caregiver.profile.print')}
        </button>
      </header>
      {profile.isPending ? (
        <div className='h-56 animate-pulse rounded-2xl bg-white' role='status'>
          <span className='sr-only'>{t(`${key}.loading`)}</span>
        </div>
      ) : null}
      {profile.isError ? (
        <div className='rounded-2xl bg-white p-8 shadow-sm' role='alert'>
          <p>{t(`${key}.profileError`)}</p>
          <button className='mt-3 text-primary underline' onClick={() => void profile.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {profile.isSuccess ? (
        <>
          <section className='overflow-hidden rounded-2xl bg-white shadow-sm'>
            <div className='h-3 bg-primary' />
            <div className='p-5 sm:p-7'>
              <div className='flex flex-wrap items-start gap-5'>
                <div className='flex shrink-0 flex-col items-center gap-2'>
                  <div className='flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-primary'>
                    {avatarMedia.data?.[0]?.downloadUrl ? (
                      <img
                        alt={t(`${key}.avatarAlt`, { name: profile.data.fullName })}
                        className='h-full w-full object-cover'
                        src={avatarMedia.data[0].downloadUrl}
                      />
                    ) : (
                      <Icon className='text-6xl' name='person' />
                    )}
                  </div>
                  <button
                    className='text-sm font-semibold text-primary underline print:hidden'
                    onClick={() => setShowAvatarEditor((current) => !current)}
                    type='button'
                  >
                    {t(`${key}.avatarUpload`)}
                  </button>
                </div>
                <div className='min-w-0 flex-1'>
                  <ProviderStatusBadge
                    label={t(`${key}.${verificationStatusKeys[profile.data.verificationStatus]}`)}
                    status={profile.data.verificationStatus}
                  />
                  <h2 className='mt-3 text-2xl font-extrabold'>{profile.data.fullName}</h2>
                  <p className='mt-2 text-sm font-semibold text-primary'>
                    {profile.data.centerName || t(`${key}.unknown`)}
                  </p>
                  <p className='mt-3 text-xs text-outline tabular-nums'>#{profile.data.id}</p>
                </div>
                <Link
                  className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary shadow-sm hover:bg-primary-container print:hidden'
                  to='/caregiver/schedule'
                >
                  <Icon name='calendar_month' />
                  {t(`${key}.viewSchedules`)}
                </Link>
              </div>
              {showAvatarEditor ? (
                <div className='mt-5 max-w-xl print:hidden'>
                  <ProviderMediaPanel ownerId={profile.data.id} ownerType='CAREGIVER_PROFILE' />
                </div>
              ) : null}
              <div className='mt-6 grid grid-cols-2 gap-5 border-t border-outline-variant/20 pt-5 sm:grid-cols-4'>
                {(
                  [
                    [
                      t(`${key}.experience`),
                      profile.data.experienceYears === undefined
                        ? '—'
                        : new Intl.NumberFormat(i18n.language).format(profile.data.experienceYears),
                      'work_history'
                    ],
                    [
                      t(`${key}.status`),
                      t(`${key}.${verificationStatusKeys[profile.data.verificationStatus]}`),
                      'verified_user'
                    ],
                    [t(`${key}.center`), profile.data.centerName || '—', 'home_health'],
                    [
                      t(`${key}.birthDate`),
                      profile.data.dateOfBirth ? formatProviderDate(profile.data.dateOfBirth, i18n.language) : '—',
                      'calendar_month'
                    ]
                  ] as const
                ).map(([label, value, icon]) => (
                  <div key={label}>
                    <p className='flex items-center gap-1 text-xl font-extrabold text-primary'>
                      <Icon className='text-primary' name={icon} />
                      {value}
                    </p>
                    <p className='mt-1 text-xs text-outline'>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className='space-y-6'>
            <div className='space-y-6'>
              <section className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='flex items-center gap-2 text-lg font-bold'>
                  <Icon className='text-primary' name='person' />
                  {t(`${key}.about`)}
                </h2>
                <p className='mt-4 text-sm leading-7 text-on-surface-variant'>
                  {profile.data.bio || t(`${key}.unknown`)}
                </p>
              </section>
              <section className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='flex items-center gap-2 text-lg font-bold'>
                  <Icon className='text-primary' name='workspace_premium' />
                  {t(`${key}.certificatesTitle`)}
                </h2>
                <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.certificateUploadHint`)}</p>
                <form
                  className='mt-4 grid gap-3 sm:grid-cols-2'
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (certificateFile) create.mutate()
                  }}
                >
                  <label className='text-sm sm:col-span-2'>
                    {t(`${key}.certificateFile`)}
                    <input
                      accept='.pdf,.jpg,.jpeg,.png'
                      className='mt-1 block w-full rounded-lg border border-outline-variant px-3 py-2 text-sm'
                      key={fileInputKey}
                      onChange={(event) => {
                        setCertificateSuccess(false)
                        const selected = event.target.files?.[0] ?? null
                        const error = selected ? validateProviderFiles('CERTIFICATE', [selected]) : null
                        setCertificateFileError(error === 'type' || error === 'size' ? error : null)
                        setCertificateFile(error ? null : selected)
                        if (error) event.target.value = ''
                      }}
                      required
                      type='file'
                    />
                  </label>
                  <label className='text-sm'>
                    {t(`${key}.certificateName`)}
                    <input
                      className='mt-1 w-full rounded-lg border border-outline-variant px-3 py-2'
                      onChange={(event) => {
                        setCertificateSuccess(false)
                        setCertificateName(event.target.value)
                      }}
                      disabled={Boolean(pendingCertificateId)}
                      required
                      value={certificateName}
                    />
                  </label>
                  <label className='text-sm'>
                    {t(`${key}.issuedBy`)}
                    <input
                      className='mt-1 w-full rounded-lg border border-outline-variant px-3 py-2'
                      onChange={(event) => {
                        setCertificateSuccess(false)
                        setIssuedBy(event.target.value)
                      }}
                      disabled={Boolean(pendingCertificateId)}
                      required
                      value={issuedBy}
                    />
                  </label>
                  <button
                    className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start'
                    disabled={create.isPending || !certificateFile}
                    type='submit'
                  >
                    {t(pendingCertificateId ? `${key}.retryCertificateUpload` : `${key}.addCertificate`)}
                  </button>
                </form>
                {certificateFileError ? (
                  <p className='mt-3 text-sm text-error' role='alert'>
                    {t(`common.providerMedia.validation.${certificateFileError}`, { maxSize: 10 })}
                  </p>
                ) : null}
                {create.isError ? (
                  <p className='mt-3 text-sm text-error' role='alert'>
                    {t(pendingCertificateId ? `${key}.certificateUploadError` : `${key}.actionError`)}
                  </p>
                ) : null}
                {certificateSuccess ? (
                  <p className='mt-3 text-sm font-semibold text-primary' role='status'>
                    {t(`${key}.certificateUploadSuccess`)}
                  </p>
                ) : null}
                {certificates.isPending ? (
                  <p className='mt-4 text-sm' role='status'>
                    {t(`${key}.loading`)}
                  </p>
                ) : null}
                {certificates.isError ? (
                  <p className='mt-4 text-sm text-error' role='alert'>
                    {t(`${key}.certificatesError`)}
                  </p>
                ) : null}
                {certificates.isSuccess && certificates.data.length === 0 ? (
                  <p className='mt-4 text-sm text-outline'>{t(`${key}.certificatesEmpty`)}</p>
                ) : null}
                {certificates.isSuccess ? (
                  <ul className='mt-4 grid gap-3 sm:grid-cols-2'>
                    {certificates.data.map((certificate) => (
                      <li
                        className={`min-w-0 rounded-2xl border p-4 transition-colors ${
                          selectedCertificateId === certificate.id
                            ? 'border-primary/35 bg-primary/5 sm:col-span-2'
                            : 'border-transparent bg-surface-container-low hover:border-primary/20'
                        }`}
                        key={certificate.id}
                      >
                        <button
                          aria-controls={`certificate-files-${certificate.id}`}
                          aria-expanded={selectedCertificateId === certificate.id}
                          className='flex w-full items-center justify-between gap-4 text-left'
                          onClick={() =>
                            setSelectedCertificateId((current) => (current === certificate.id ? null : certificate.id))
                          }
                          type='button'
                        >
                          <span className='min-w-0'>
                            <strong className='block truncate text-sm font-semibold text-on-surface'>
                              {certificate.certificateName}
                            </strong>
                            <span className='mt-1 block truncate text-xs text-outline'>{certificate.issuedBy}</span>
                            <span className='mt-2 block text-sm font-semibold text-primary'>
                              {t(
                                selectedCertificateId === certificate.id
                                  ? `${key}.hideCertificateFiles`
                                  : `${key}.certificateFiles`
                              )}
                            </span>
                          </span>
                          <Icon
                            className='shrink-0 text-primary'
                            name={
                              selectedCertificateId === certificate.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                            }
                          />
                        </button>
                        {selectedCertificateId === certificate.id ? (
                          <div className='mt-4' id={`certificate-files-${certificate.id}`}>
                            <ProviderMediaPanel embedded ownerId={certificate.id} ownerType='CERTIFICATE' />
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>
          </div>
        </>
      ) : null}
    </main>
  )
}
