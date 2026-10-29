import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Link } from 'react-router'

import {
  createCertificate,
  fetchMyCaregiverProfile,
  fetchCaregiverServices,
  fetchCertificates,
  fetchProviderMedia,
  providerKeys,
  removeMedia,
  uploadMedia
} from '~/entities/provider/provider-api'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { CaregiverTimeOffs } from '~/entities/provider/caregiver-time-offs'
import { ProviderMediaPanel, validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
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
  const [showCertificateForm, setShowCertificateForm] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)
  const [avatarFileError, setAvatarFileError] = useState<'count' | 'type' | 'size' | null>(null)
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const avatarMedia = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', profile.data?.id ?? ''),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  const account = useAuthUser()
  const services = useQuery({
    queryKey: providerKeys.caregiverServices(profile.data?.id ?? ''),
    queryFn: () => fetchCaregiverServices(profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  const certificates = useQuery({
    queryKey: providerKeys.certificates(profile.data?.id ?? ''),
    queryFn: () => fetchCertificates(profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  const replaceAvatar = useMutation({
    mutationFn: async (file: File) => {
      const ownerId = profile.data!.id
      await uploadMedia('CAREGIVER_PROFILE', ownerId, [file])
      await Promise.all(
        (avatarMedia.data ?? []).map((item) => removeMedia('CAREGIVER_PROFILE', ownerId, item.mediaFileId))
      )
    },
    onSettled: async () => {
      if (!profile.data?.id) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.media('CAREGIVER_PROFILE', profile.data.id) }),
        queryClient.invalidateQueries({ queryKey: providerKeys.catalog })
      ])
    }
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
      setShowCertificateForm(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.certificates(profile.data!.id) }),
        queryClient.invalidateQueries({ queryKey: providerKeys.media('CERTIFICATE', certificateId) })
      ])
    }
  })
  useDocumentTitle(t(`${key}.profileTitle`))
  return (
    <main className='caregiver-print-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10'>
      <header className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
        <div className='max-w-3xl'>
          <h1 className='text-3xl font-bold leading-tight tracking-[-0.04em] text-on-surface sm:text-4xl'>
            {t('caregiver.profile.title')}
          </h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant sm:text-base'>
            {t('caregiver.profile.subtitle')}
          </p>
        </div>
        <button
          className='inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto print:hidden'
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
          <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-white'>
            <div className='p-5 sm:p-8 lg:p-9'>
              <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
                <div className='flex shrink-0 flex-col items-start gap-2'>
                  <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-surface-container-low text-primary sm:h-28 sm:w-28'>
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
                    className='text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 print:hidden'
                    disabled={!avatarMedia.isSuccess || replaceAvatar.isPending}
                    onClick={() => avatarInput.current?.click()}
                    type='button'
                  >
                    {t(replaceAvatar.isPending ? `${key}.avatarUploading` : `${key}.avatarUpload`)}
                  </button>
                  <input
                    accept='.jpg,.jpeg,.png,.webp'
                    aria-label={t(`${key}.avatarUpload`)}
                    className='sr-only print:hidden'
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (!file) return
                      const error = validateProviderFiles('CAREGIVER_PROFILE', [file])
                      setAvatarFileError(error)
                      if (error) return
                      replaceAvatar.mutate(file)
                    }}
                    ref={avatarInput}
                    tabIndex={-1}
                    type='file'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <ProviderStatusBadge
                    label={t(`${key}.${verificationStatusKeys[profile.data.verificationStatus]}`)}
                    status={profile.data.verificationStatus}
                  />
                  <h2 className='mt-3 text-3xl font-bold tracking-[-0.035em] text-on-surface sm:text-4xl'>
                    {profile.data.fullName}
                  </h2>
                  <p className='mt-1.5 text-sm font-medium text-on-surface-variant'>
                    {profile.data.centerName || t(`${key}.unknown`)}
                  </p>
                </div>
                <Link
                  className='inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:ml-auto print:hidden'
                  to='/caregiver/schedule'
                >
                  <Icon name='calendar_month' />
                  {t(`${key}.viewSchedules`)}
                </Link>
              </div>
              {avatarFileError ? (
                <p className='mt-4 text-sm text-error print:hidden' role='alert'>
                  {t(`common.providerMedia.validation.${avatarFileError}`, { maxSize: 5 })}
                </p>
              ) : null}
              {avatarMedia.isError || replaceAvatar.isError ? (
                <p className='mt-4 text-sm text-error print:hidden' role='alert'>
                  {t(apiRequestErrorKey(replaceAvatar.error ?? avatarMedia.error, `${key}.avatarUploadError`))}
                </p>
              ) : null}
              {replaceAvatar.isSuccess ? (
                <p className='mt-4 text-sm font-medium text-primary print:hidden' role='status'>
                  {t(`${key}.avatarUploadSuccess`)}
                </p>
              ) : null}
              <dl className='mt-7 grid gap-x-8 gap-y-6 border-t border-outline-variant/50 pt-7 sm:grid-cols-2 xl:grid-cols-4'>
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
                      t(`${key}.birthDate`),
                      profile.data.dateOfBirth ? formatProviderDate(profile.data.dateOfBirth, i18n.language) : '—',
                      'calendar_month'
                    ],
                    [t(`${key}.phone`), account?.phoneNumber || '—', 'call'],
                    [t(`${key}.email`), account?.email || '—', 'mail']
                  ] as const
                ).map(([label, value, icon]) => (
                  <div className='min-w-0' key={label}>
                    <dt className='flex items-center gap-2 text-xs font-medium text-on-surface-variant'>
                      <Icon className='text-lg text-primary' name={icon} />
                      {label}
                    </dt>
                    <dd className='mt-2 min-w-0 break-words text-base font-semibold leading-6 text-on-surface [overflow-wrap:anywhere]'>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]'>
            <section className='min-w-0 rounded-2xl border border-outline-variant/50 bg-white p-6 sm:p-7'>
              <h2 className='text-xl font-bold tracking-[-0.025em] text-on-surface'>{t(`${key}.about`)}</h2>
              <p className='mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant'>
                {profile.data.bio || t(`${key}.unknown`)}
              </p>
            </section>
            <section
              aria-labelledby='caregiver-services-title'
              className='min-w-0 rounded-2xl border border-outline-variant/50 bg-white p-6 sm:p-7'
            >
              <h2 className='text-xl font-bold tracking-[-0.025em] text-on-surface' id='caregiver-services-title'>
                {t(`${key}.servicesTitle`)}
              </h2>
              <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.servicesHint`)}</p>
              {services.isPending ? (
                <p className='mt-4 text-sm text-on-surface-variant' role='status'>
                  {t(`${key}.loading`)}
                </p>
              ) : null}
              {services.isError ? (
                <p className='mt-4 text-sm text-error' role='alert'>
                  {t(`${key}.servicesError`)}
                </p>
              ) : null}
              {services.isSuccess && services.data.length === 0 ? (
                <p className='mt-4 rounded-lg bg-warning-container p-3 text-sm text-on-warning-container'>
                  {t(`${key}.servicesEmpty`)}
                </p>
              ) : null}
              {services.isSuccess && services.data.length > 0 ? (
                <ul className='mt-5 grid gap-2 sm:grid-cols-2'>
                  {services.data.map((service) => (
                    <li
                      className='flex min-w-0 items-start gap-2 rounded-lg bg-surface-container-low px-3 py-3 text-sm font-medium leading-5 text-on-surface'
                      key={service.centerServiceId}
                    >
                      <Icon className='shrink-0 text-base text-primary' name='check_circle' />
                      {service.serviceName}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
          <div className='print:hidden [&>section]:mt-0'>
            <CaregiverTimeOffs caregiverId={profile.data.id} copy='caregiver.provider.timeOff' />
          </div>
          <section className='rounded-2xl border border-outline-variant/50 bg-white p-6 sm:p-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h2 className='text-xl font-bold tracking-[-0.025em] text-on-surface sm:text-2xl'>
                  {t(`${key}.certificatesTitle`)}
                </h2>
                <p className='mt-1.5 text-sm leading-6 text-on-surface-variant'>{t(`${key}.certificateUploadHint`)}</p>
              </div>
              <button
                aria-expanded={showCertificateForm}
                className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                onClick={() => setShowCertificateForm((current) => !current)}
                type='button'
              >
                <Icon name={showCertificateForm ? 'close' : 'add'} />
                {t(showCertificateForm ? `${key}.closeCertificateForm` : `${key}.openCertificateForm`)}
              </button>
            </div>
            {showCertificateForm ? (
              <form
                className='mt-6 grid gap-5 rounded-xl border border-outline-variant/50 bg-surface-container-low p-5 sm:grid-cols-2 sm:p-6'
                onSubmit={(event) => {
                  event.preventDefault()
                  if (certificateFile) create.mutate()
                }}
              >
                <label className='flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-white px-4 py-5 text-center transition-colors hover:border-primary hover:bg-primary-fixed/20 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary sm:col-span-2'>
                  <Icon className='text-3xl text-primary' name='upload_file' />
                  <span className='mt-2 text-sm font-semibold text-primary'>
                    {certificateFile ? certificateFile.name : t(`${key}.certificateFile`)}
                  </span>
                  <span className='mt-1 text-xs text-on-surface-variant'>{t(`${key}.certificateFileHint`)}</span>
                  <input
                    accept='.pdf,.jpg,.jpeg,.png'
                    aria-label={t(`${key}.certificateFile`)}
                    className='sr-only'
                    key={fileInputKey}
                    onChange={(event) => {
                      setCertificateSuccess(false)
                      const selected = event.target.files?.[0] ?? null
                      const error = selected ? validateProviderFiles('CERTIFICATE', [selected]) : null
                      setCertificateFileError(error === 'type' || error === 'size' ? error : null)
                      setCertificateFile(error ? null : selected)
                      if (error) event.target.value = ''
                    }}
                    type='file'
                  />
                </label>
                <label className='text-sm font-medium text-on-surface'>
                  {t(`${key}.certificateName`)}
                  <input
                    className='mt-2 w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    onChange={(event) => {
                      setCertificateSuccess(false)
                      setCertificateName(event.target.value)
                    }}
                    disabled={Boolean(pendingCertificateId)}
                    required
                    value={certificateName}
                  />
                </label>
                <label className='text-sm font-medium text-on-surface'>
                  {t(`${key}.issuedBy`)}
                  <input
                    className='mt-2 w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
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
                  className='min-h-11 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 sm:col-span-2 sm:justify-self-start'
                  disabled={create.isPending || !certificateFile}
                  type='submit'
                >
                  {t(pendingCertificateId ? `${key}.retryCertificateUpload` : `${key}.addCertificate`)}
                </button>
              </form>
            ) : null}
            {certificateFileError ? (
              <p className='mt-3 text-sm text-error' role='alert'>
                {t(`common.providerMedia.validation.${certificateFileError}`, { maxSize: 10 })}
              </p>
            ) : null}
            {create.isError ? (
              <p className='mt-3 text-sm text-error' role='alert'>
                {t(
                  pendingCertificateId
                    ? `${key}.certificateUploadError`
                    : apiRequestErrorKey(create.error, `${key}.actionError`)
                )}
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
              <div className='mt-6 flex items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-5 text-sm text-on-surface-variant'>
                <Icon className='text-2xl text-primary' name='workspace_premium' />
                <p>{t(`${key}.certificatesEmpty`)}</p>
              </div>
            ) : null}
            {certificates.isSuccess && certificates.data.length > 0 ? (
              <ul className='mt-6 divide-y divide-outline-variant/50 border-t border-outline-variant/50'>
                {certificates.data.map((certificate) => (
                  <li className='min-w-0 py-1' key={certificate.id}>
                    <button
                      aria-controls={`certificate-files-${certificate.id}`}
                      aria-expanded={selectedCertificateId === certificate.id}
                      className='flex w-full items-center gap-4 rounded-lg px-2 py-4 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      onClick={() =>
                        setSelectedCertificateId((current) => (current === certificate.id ? null : certificate.id))
                      }
                      type='button'
                    >
                      <span
                        aria-hidden='true'
                        className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary'
                      >
                        <Icon name='workspace_premium' />
                      </span>
                      <span className='min-w-0 flex-1'>
                        <strong className='block break-words text-sm font-semibold leading-6 text-on-surface'>
                          {certificate.certificateName}
                        </strong>
                        <span className='block break-words text-xs leading-5 text-on-surface-variant'>
                          {certificate.issuedBy}
                        </span>
                      </span>
                      <span className='hidden shrink-0 text-xs font-semibold text-primary sm:block'>
                        {t(
                          selectedCertificateId === certificate.id
                            ? `${key}.hideCertificateFiles`
                            : `${key}.certificateFiles`
                        )}
                      </span>
                      <Icon
                        className='shrink-0 text-primary'
                        name={selectedCertificateId === certificate.id ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      />
                    </button>
                    {selectedCertificateId === certificate.id ? (
                      <div className='px-2 pb-5 sm:pl-16' id={`certificate-files-${certificate.id}`}>
                        <ProviderMediaPanel embedded ownerId={certificate.id} ownerType='CERTIFICATE' />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  )
}
