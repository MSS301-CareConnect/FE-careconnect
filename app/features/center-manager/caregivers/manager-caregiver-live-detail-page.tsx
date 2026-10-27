import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import {
  createCertificate,
  fetchCaregiver,
  fetchCertificates,
  providerKeys,
  removeCaregiver,
  removeCertificate,
  saveCaregiver,
  saveCertificate,
  uploadMedia
} from '~/entities/provider/provider-api'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { ProviderMediaPanel, validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ProviderCaregiverRecord, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.provider' as const
const inputClass = 'mt-1 w-full rounded-lg border border-outline-variant bg-white px-3 py-2'
const genderOptions = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const
const statusOptions = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended' } as const
const statusLabels = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationLabels = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const

function CaregiverEditor({ person, onDone }: { person: ProviderCaregiverRecord; onDone: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(person.fullName)
  const [experience, setExperience] = useState(person.experienceYears ?? 0)
  const [bio, setBio] = useState(person.bio ?? '')
  const [status, setStatus] = useState(person.caregiverStatus)
  const [birthDate, setBirthDate] = useState(person.dateOfBirth ?? '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>(person.gender ?? '')
  const update = useMutation({
    mutationFn: () =>
      saveCaregiver(person.id, {
        fullName: name.trim(),
        experienceYears: experience,
        bio: bio.trim() || undefined,
        caregiverStatus: status,
        dateOfBirth: birthDate || undefined,
        gender: gender || undefined,
        version: person.version
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregiver(person.id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(person.centerId) })
      onDone()
    }
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    update.mutate()
  }
  return (
    <form className='space-y-4 rounded-xl border bg-white p-5' onSubmit={submit}>
      <h2 className='text-lg font-semibold'>{t(`${key}.editCaregiver`)}</h2>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='text-sm'>
          {t(`${key}.caregiverName`)}
          <input className={inputClass} onChange={(event) => setName(event.target.value)} required value={name} />
        </label>
        <label className='text-sm'>
          {t(`${key}.experience`)}
          <input
            className={inputClass}
            max={80}
            min={0}
            onChange={(event) => setExperience(Number(event.target.value))}
            required
            type='number'
            value={experience}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.gender`)}
          <select
            className={inputClass}
            onChange={(event) => setGender(event.target.value as typeof gender)}
            value={gender}
          >
            <option value=''>{t(`${key}.unknown`)}</option>
            {(
              Object.entries(genderOptions) as [
                keyof typeof genderOptions,
                (typeof genderOptions)[keyof typeof genderOptions]
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`${key}.${label}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='text-sm'>
          {t(`${key}.birthDate`)}
          <input
            className={inputClass}
            onChange={(event) => setBirthDate(event.target.value)}
            type='date'
            value={birthDate}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.status`)}
          <select
            className={inputClass}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            value={status}
          >
            {(
              Object.entries(statusOptions) as [
                keyof typeof statusOptions,
                (typeof statusOptions)[keyof typeof statusOptions]
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`${key}.${label}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='text-sm sm:col-span-2'>
          {t(`${key}.bio`)}
          <textarea className={inputClass} onChange={(event) => setBio(event.target.value)} value={bio} />
        </label>
      </div>
      {update.isError ? <p role='alert'>{t(`${key}.actionError`)}</p> : null}
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
          disabled={update.isPending}
          type='submit'
        >
          {t(`${key}.save`)}
        </button>
        <button className='rounded-lg border px-4 py-2' onClick={onDone} type='button'>
          {t(`${key}.cancel`)}
        </button>
      </div>
    </form>
  )
}

function CertificateEditor({
  caregiverId,
  certificate,
  onDone
}: {
  caregiverId: string
  certificate?: ProviderCertificateRecord
  onDone: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(certificate?.certificateName ?? '')
  const [issuedBy, setIssuedBy] = useState(certificate?.issuedBy ?? '')
  const [number, setNumber] = useState(certificate?.credentialNumber ?? '')
  const [issuedDate, setIssuedDate] = useState(certificate?.issuedDate ?? '')
  const [expiryDate, setExpiryDate] = useState(certificate?.expiryDate ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<'type' | 'size' | null>(null)
  const [pendingCertificateId, setPendingCertificateId] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async () => {
      const request = {
        certificateName: name.trim(),
        issuedBy: issuedBy.trim(),
        credentialNumber: number.trim() || undefined,
        issuedDate: issuedDate || undefined,
        expiryDate: expiryDate || undefined
      }
      const certificateId =
        pendingCertificateId ??
        (certificate
          ? (await saveCertificate(certificate.id, { ...request, version: certificate.version })).id
          : (await createCertificate(caregiverId, request)).id)
      if (file) {
        setPendingCertificateId(certificateId)
        try {
          await uploadMedia('CERTIFICATE', certificateId, [file])
        } catch (error) {
          await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
          throw error
        }
      }
      return certificateId
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
      onDone()
    }
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }
  return (
    <form className='space-y-4 rounded-lg border p-4' onSubmit={submit}>
      <h3 className='font-semibold'>{t(certificate ? `${key}.editCertificate` : `${key}.addCertificate`)}</h3>
      <label className='block text-sm'>
        {t(`${key}.certificateFile`)}
        <input
          accept='.pdf,.jpg,.jpeg,.png'
          className={inputClass}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null
            const error = selected ? validateProviderFiles('CERTIFICATE', [selected]) : null
            setFileError(error === 'type' || error === 'size' ? error : null)
            setFile(error ? null : selected)
            if (error) event.target.value = ''
          }}
          required={!certificate}
          type='file'
        />
      </label>
      <div className='grid gap-3 sm:grid-cols-2'>
        <label className='text-sm'>
          {t(`${key}.certificateName`)}
          <input
            className={inputClass}
            disabled={Boolean(pendingCertificateId)}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.issuedBy`)}
          <input
            className={inputClass}
            disabled={Boolean(pendingCertificateId)}
            onChange={(event) => setIssuedBy(event.target.value)}
            required
            value={issuedBy}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.credentialNumber`)}
          <input
            className={inputClass}
            disabled={Boolean(pendingCertificateId)}
            onChange={(event) => setNumber(event.target.value)}
            value={number}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.issuedDate`)}
          <input
            className={inputClass}
            disabled={Boolean(pendingCertificateId)}
            onChange={(event) => setIssuedDate(event.target.value)}
            type='date'
            value={issuedDate}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.expiryDate`)}
          <input
            className={inputClass}
            disabled={Boolean(pendingCertificateId)}
            onChange={(event) => setExpiryDate(event.target.value)}
            type='date'
            value={expiryDate}
          />
        </label>
      </div>
      {fileError ? <p role='alert'>{t(`common.providerMedia.validation.${fileError}`, { maxSize: 10 })}</p> : null}
      {save.isError ? (
        <p role='alert'>{t(pendingCertificateId ? `${key}.certificateUploadError` : `${key}.actionError`)}</p>
      ) : null}
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50'
          disabled={save.isPending || (!certificate && !file)}
          type='submit'
        >
          {t(pendingCertificateId ? `${key}.retryCertificateUpload` : file ? `${key}.saveAndUpload` : `${key}.save`)}
        </button>
        <button className='rounded-lg border px-3 py-2' onClick={onDone} type='button'>
          {t(`${key}.cancel`)}
        </button>
      </div>
    </form>
  )
}

function Certificates({ caregiverId }: { caregiverId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editor, setEditor] = useState<string | null>(null)
  const [mediaFor, setMediaFor] = useState<string | null>(null)
  const certificates = useQuery({
    queryKey: providerKeys.certificates(caregiverId),
    queryFn: () => fetchCertificates(caregiverId),
    retry: false
  })
  const archive = useMutation({
    mutationFn: (certificate: ProviderCertificateRecord) => removeCertificate(certificate.id, certificate.version),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
  })
  return (
    <section className='space-y-4 rounded-xl border bg-white p-5'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{t(`${key}.certificatesTitle`)}</h2>
        <button className='text-primary underline' onClick={() => setEditor('new')} type='button'>
          {t(`${key}.addCertificate`)}
        </button>
      </div>
      {certificates.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {certificates.isError ? (
        <div role='alert'>
          <p>{t(`${key}.certificatesError`)}</p>
          <button className='text-primary underline' onClick={() => void certificates.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {certificates.isSuccess && certificates.data.length === 0 ? <p>{t(`${key}.certificatesEmpty`)}</p> : null}
      {certificates.isSuccess ? (
        <ul className='divide-y'>
          {certificates.data.map((certificate) => (
            <li className='flex flex-wrap items-center justify-between gap-3 py-3' key={certificate.id}>
              <div>
                <strong>{certificate.certificateName}</strong>
                <p className='text-sm text-outline'>
                  {certificate.issuedBy} · {t(`${key}.${verificationLabels[certificate.verificationStatus]}`)}
                </p>
              </div>
              <div className='flex gap-3'>
                <button className='text-primary underline' onClick={() => setEditor(certificate.id)} type='button'>
                  {t(`${key}.editCertificate`)}
                </button>
                <button
                  className='text-primary underline'
                  onClick={() => setMediaFor(mediaFor === certificate.id ? null : certificate.id)}
                  type='button'
                >
                  {t(`${key}.uploadCertificateFile`)}
                </button>
                <button
                  className='text-error underline disabled:opacity-50'
                  disabled={archive.isPending}
                  onClick={() => {
                    if (window.confirm(t(`${key}.confirmArchiveCertificate`))) archive.mutate(certificate)
                  }}
                  type='button'
                >
                  {t(`${key}.archiveCertificate`)}
                </button>
              </div>
              {mediaFor === certificate.id ? (
                <div className='w-full'>
                  <ProviderMediaPanel ownerId={certificate.id} ownerType='CERTIFICATE' />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {editor ? (
        <CertificateEditor
          caregiverId={caregiverId}
          certificate={certificates.data?.find((item) => item.id === editor)}
          key={editor}
          onDone={() => setEditor(null)}
        />
      ) : null}
      {archive.isError ? <p role='alert'>{t(`${key}.actionError`)}</p> : null}
    </section>
  )
}

export function ManagerCaregiverDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const caregiver = useQuery({
    queryKey: providerKeys.caregiver(id),
    queryFn: () => fetchCaregiver(id),
    retry: false,
    enabled: Boolean(id)
  })
  const archive = useMutation({
    mutationFn: () => removeCaregiver(id, caregiver.data!.version),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(user!.centerId!) })
      navigate('/center-manager/caregivers')
    }
  })
  useDocumentTitle(caregiver.data?.fullName ?? t(`${key}.caregiversTitle`))
  if (!user?.centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noCenter`)}
      </main>
    )
  if (caregiver.isPending)
    return (
      <main className='mx-auto max-w-6xl p-6' role='status'>
        {t(`${key}.loading`)}
      </main>
    )
  if (caregiver.isError)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        <p>{t(`${key}.caregiverError`)}</p>
        <button className='text-primary underline' onClick={() => void caregiver.refetch()} type='button'>
          {t(`${key}.retry`)}
        </button>
      </main>
    )
  if (caregiver.data.centerId !== user.centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noAccess`)}
      </main>
    )
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-container'
        to='/center-manager/caregivers'
      >
        <Icon name='arrow_back' />
        {t(`${key}.back`)}
      </Link>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-wrap items-start justify-between gap-5'>
          <div className='flex min-w-0 flex-wrap items-center gap-5'>
            <span className='flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-primary sm:h-28 sm:w-28'>
              <Icon className='text-5xl' name='person' />
            </span>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-extrabold tracking-tight'>{caregiver.data.fullName}</h1>
                <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                  {t(`${key}.${statusLabels[caregiver.data.caregiverStatus]}`)}
                </span>
              </div>
              <p className='mt-2 text-xs text-outline'>
                #{caregiver.data.id}
                {caregiver.data.createdAt ? ` · ${formatProviderDate(caregiver.data.createdAt, i18n.language)}` : ''}
              </p>
              {caregiver.data.ratingAverage !== undefined ? (
                <p className='mt-2 flex items-center gap-1 text-sm font-semibold'>
                  <Icon className='text-amber-500' filled name='star' />
                  {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(
                    caregiver.data.ratingAverage
                  )}
                  <span className='ml-2 font-normal text-outline'>
                    {t('centerManager.provider.reviewsValue', { count: caregiver.data.ratingCount ?? 0 })}
                  </span>
                </p>
              ) : null}
              <p className='mt-3 inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary'>
                <Icon className='text-lg' name='verified_user' />
                {t(`${key}.${verificationLabels[caregiver.data.verificationStatus]}`)}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2.5 text-xs font-semibold text-primary'
              onClick={() => setEditing(true)}
              type='button'
            >
              <Icon name='edit' />
              {t(`${key}.editCaregiver`)}
            </button>
            <button
              className='flex items-center gap-2 rounded-lg bg-error-container px-3 py-2.5 text-xs font-semibold text-on-error-container disabled:opacity-50'
              disabled={archive.isPending}
              onClick={() => {
                if (window.confirm(t(`${key}.confirmArchive`))) archive.mutate()
              }}
              type='button'
            >
              <Icon name='block' />
              {t(`${key}.archive`)}
            </button>
          </div>
        </div>
        {archive.isError ? (
          <p className='mt-4 text-error' role='alert'>
            {t(`${key}.actionError`)}
          </p>
        ) : null}
      </section>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            [
              t(`${key}.experience`),
              caregiver.data.experienceYears !== undefined
                ? t(`${key}.yearsValue`, { count: caregiver.data.experienceYears })
                : t(`${key}.unknown`),
              'work_history'
            ],
            [
              t(`${key}.verification`),
              t(`${key}.${verificationLabels[caregiver.data.verificationStatus]}`),
              'health_and_safety'
            ],
            [t(`${key}.status`), t(`${key}.${statusLabels[caregiver.data.caregiverStatus]}`), 'medical_information'],
            [
              t(`${key}.birthDate`),
              caregiver.data.dateOfBirth
                ? formatProviderDate(caregiver.data.dateOfBirth, i18n.language)
                : t(`${key}.unknown`),
              'calendar_month'
            ]
          ] as const
        ).map(([label, value, icon]) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={label}>
            <div className='flex items-center justify-between gap-2'>
              <h2 className='text-xs font-semibold text-outline'>{label}</h2>
              <Icon className='text-2xl text-primary' name={icon} />
            </div>
            <p className='mt-4 text-xl font-extrabold text-primary'>{value}</p>
          </section>
        ))}
      </div>
      {editing ? (
        <CaregiverEditor key={caregiver.data.version} onDone={() => setEditing(false)} person={caregiver.data} />
      ) : null}
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='space-y-6 lg:col-span-5'>
          <section className='rounded-xl bg-white p-5 shadow-sm'>
            <h2 className='flex items-center gap-2 text-lg font-bold'>
              <Icon className='text-primary' name='person' />
              {t(`${key}.profileTitle`)}
            </h2>
            <p className='mt-4 text-sm leading-7 text-on-surface-variant'>
              {caregiver.data.bio || t(`${key}.unknown`)}
            </p>
          </section>
          <ProviderMediaPanel ownerId={id} ownerType='CAREGIVER_PROFILE' />
        </div>
        <div className='lg:col-span-7'>
          <Certificates caregiverId={id} />
        </div>
      </div>
    </main>
  )
}
