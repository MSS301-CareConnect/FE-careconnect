import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  cancelMyShiftRegistration,
  createCertificate,
  fetchMyCaregiverProfile,
  fetchMyShiftRegistrations,
  fetchCertificates,
  fetchProviderMedia,
  fetchWorkShifts,
  providerKeys,
  registerForShift,
  uploadMedia
} from '~/entities/provider/provider-api'
import { formatProviderDate, formatProviderTime } from '~/entities/provider/provider-format'
import { ProviderMediaPanel, validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const key = 'caregiver.provider' as const
const verificationStatusKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
const registrationStatusKeys = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const

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
      setSelectedCertificateId(null)
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
                  <span className='rounded-md bg-secondary-container px-2 py-1 text-[10px] font-bold text-primary'>
                    {t(`${key}.${verificationStatusKeys[profile.data.verificationStatus]}`)}
                  </span>
                  <h2 className='mt-3 text-2xl font-extrabold'>{profile.data.fullName}</h2>
                  <p className='mt-2 text-sm font-semibold text-primary'>
                    {profile.data.centerName || t(`${key}.unknown`)}
                  </p>
                  <p className='mt-3 text-xs text-outline'>#{profile.data.id}</p>
                </div>
                <Link
                  className='inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white print:hidden'
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
                      <li className='rounded-xl bg-surface-container-low p-4' key={certificate.id}>
                        <strong className='text-sm'>{certificate.certificateName}</strong>
                        <p className='mt-1 text-xs text-outline'>{certificate.issuedBy}</p>
                        <button
                          className='mt-3 text-sm font-semibold text-primary underline'
                          onClick={() => setSelectedCertificateId(certificate.id)}
                          type='button'
                        >
                          {t(`${key}.certificateFiles`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selectedCertificateId ? (
                  <div className='mt-4'>
                    <ProviderMediaPanel
                      key={selectedCertificateId}
                      ownerId={selectedCertificateId}
                      ownerType='CERTIFICATE'
                    />
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </>
      ) : null}
    </main>
  )
}

export function CaregiverProviderWorkShiftsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [registrationPage, setRegistrationPage] = useState(0)
  const [note, setNote] = useState('')
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const shifts = useQuery({
    queryKey: [...providerKeys.shifts(profile.data?.centerId ?? ''), 'OPEN', page],
    queryFn: () => fetchWorkShifts({ centerId: profile.data!.centerId, status: 'OPEN', page, size: 20 }),
    enabled: Boolean(profile.data?.centerId),
    retry: false
  })
  const registrations = useQuery({
    queryKey: [...providerKeys.myRegistrations, registrationPage],
    queryFn: () => fetchMyShiftRegistrations({ page: registrationPage, size: 20 }),
    retry: false
  })
  const register = useMutation({
    mutationFn: (id: string) => registerForShift(id, { caregiverNote: note.trim() || undefined }),
    onSuccess: async () => {
      setNote('')
      await queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations })
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(profile.data?.centerId ?? '') })
    }
  })
  const cancel = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => cancelMyShiftRegistration(id, version),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations })
  })
  useDocumentTitle(t(`${key}.workShiftsTitle`))
  return (
    <main className='mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.workShiftsTitle`)}</h1>
          <p className='mt-2 text-sm text-on-surface-variant'>{profile.data?.centerName}</p>
        </div>
        <span className='rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary'>
          {t(`${key}.summary`, { count: shifts.data?.totalElements ?? 0 })}
        </span>
      </header>
      {profile.isError ? <p role='alert'>{t(`${key}.profileError`)}</p> : null}
      <label className='block rounded-2xl bg-white p-5 text-sm font-semibold shadow-sm'>
        {t(`${key}.note`)}
        <textarea
          className='mt-3 w-full rounded-xl bg-surface-container-low p-3 font-normal outline-none focus:ring-2 focus:ring-primary'
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </label>
      {shifts.isPending && !profile.isError ? (
        <p className='rounded-xl bg-white p-6 shadow-sm' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {shifts.isError ? (
        <p className='rounded-xl bg-white p-6 shadow-sm' role='alert'>
          {t(`${key}.shiftsError`)}
        </p>
      ) : null}
      {shifts.isSuccess ? (
        <section className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          <h2 className='flex items-center gap-2 border-b border-outline-variant/20 p-5 text-lg font-bold'>
            <Icon className='text-primary' name='event_available' />
            {t(`${key}.openShiftsTitle`)}
          </h2>
          {shifts.data.items.length === 0 ? <p className='p-5'>{t(`${key}.shiftsEmpty`)}</p> : null}
          <ul className='divide-y divide-outline-variant/20'>
            {shifts.data.items.map((shift) => (
              <li
                className='flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-surface-container-low/40'
                key={shift.id}
              >
                <div>
                  <strong>
                    {formatProviderDate(shift.workDate, i18n.language)} ·{' '}
                    {formatProviderTime(shift.startTime, i18n.language)}–
                    {formatProviderTime(shift.endTime, i18n.language)}
                  </strong>
                  <p className='mt-1 text-sm text-on-surface-variant'>{shift.shiftType}</p>
                </div>
                <button
                  className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-50'
                  disabled={register.isPending}
                  onClick={() => register.mutate(shift.id)}
                  type='button'
                >
                  {t(`${key}.register`)}
                </button>
              </li>
            ))}
          </ul>
          <div className='flex justify-between border-t border-outline-variant/20 p-4 text-sm text-primary'>
            <button disabled={page === 0} onClick={() => setPage(page - 1)} type='button'>
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, shifts.data.totalPages) })}</span>
            <button disabled={page + 1 >= shifts.data.totalPages} onClick={() => setPage(page + 1)} type='button'>
              {t(`${key}.next`)}
            </button>
          </div>
        </section>
      ) : null}
      <h2 className='flex items-center gap-2 text-xl font-bold'>
        <Icon className='text-primary' name='fact_check' />
        {t(`${key}.registrationsTitle`)}
      </h2>
      {registrations.isPending ? (
        <p className='rounded-xl bg-white p-6 shadow-sm' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {registrations.isError ? (
        <p className='rounded-xl bg-white p-6 shadow-sm' role='alert'>
          {t(`${key}.registrationsError`)}
        </p>
      ) : null}
      {registrations.isSuccess ? (
        <section className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          {registrations.data.items.length === 0 ? <p className='p-5'>{t(`${key}.registrationsEmpty`)}</p> : null}
          <ul className='divide-y divide-outline-variant/20'>
            {registrations.data.items.map((item) => (
              <li className='flex flex-wrap items-center justify-between gap-3 p-5' key={item.id}>
                <div>
                  <strong>{item.workShiftId}</strong>
                  <p className='mt-1 text-sm text-primary'>
                    {t(`${key}.${registrationStatusKeys[item.registrationStatus]}`)}
                  </p>
                </div>
                {item.registrationStatus === 'PENDING' ? (
                  <button
                    className='rounded-lg bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container disabled:opacity-50'
                    disabled={cancel.isPending}
                    onClick={() => {
                      if (window.confirm(t(`${key}.confirmCancel`)))
                        cancel.mutate({ id: item.id, version: item.version })
                    }}
                    type='button'
                  >
                    {t(`${key}.cancelRegistration`)}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <div className='flex justify-between border-t border-outline-variant/20 p-4 text-sm text-primary'>
            <button
              disabled={registrationPage === 0}
              onClick={() => setRegistrationPage(registrationPage - 1)}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>
              {t(`${key}.page`, { page: registrationPage + 1, pages: Math.max(1, registrations.data.totalPages) })}
            </span>
            <button
              disabled={registrationPage + 1 >= registrations.data.totalPages}
              onClick={() => setRegistrationPage(registrationPage + 1)}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        </section>
      ) : null}
      {register.isError || cancel.isError ? <p role='alert'>{t(`${key}.actionError`)}</p> : null}
    </main>
  )
}
