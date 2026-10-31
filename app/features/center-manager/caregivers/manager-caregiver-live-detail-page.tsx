import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import {
  changeCaregiverStatus,
  fetchCaregiver,
  fetchProviderMedia,
  providerKeys,
  removeCaregiver,
  saveCaregiver
} from '~/entities/provider/provider-api'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { CaregiverTimeOffs } from '~/entities/provider/caregiver-time-offs'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

import { CaregiverServicesEditor } from './components/caregiver-services-editor'
import { ManagerCertificates } from './components/manager-certificates'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { Avatar } from '~/shared/ui/avatar'

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
  const canActivate = person.verificationStatus === 'VERIFIED'
  const [birthDate, setBirthDate] = useState(person.dateOfBirth ?? '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>(person.gender ?? '')
  const update = useMutation({
    mutationFn: async () => {
      // M-12: ProviderService changes status only through its own PATCH (it also flags the caregiver's visits, H-11).
      // The PATCH runs first because it flushes and returns the new version; the profile PUT returns it before flushing.
      const version =
        status === person.caregiverStatus
          ? person.version
          : (await changeCaregiverStatus(person.id, { status, version: person.version })).version
      await saveCaregiver(person.id, {
        fullName: name.trim(),
        experienceYears: experience,
        bio: bio.trim() || undefined,
        dateOfBirth: birthDate || undefined,
        gender: gender || undefined,
        version
      })
    },
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
              // PRV-06: only a verified caregiver can be made active.
              <option
                disabled={value === 'ACTIVE' && !canActivate && person.caregiverStatus !== 'ACTIVE'}
                key={value}
                value={value}
              >
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
      {update.isError ? <p role='alert'>{t(apiRequestErrorKey(update.error, `${key}.actionError`))}</p> : null}
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

export function ManagerCaregiverDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const caregiver = useQuery({
    queryKey: providerKeys.caregiver(id),
    queryFn: () => fetchCaregiver(id),
    retry: false,
    enabled: Boolean(id)
  })
  const avatarMedia = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', id),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', id),
    retry: false,
    enabled: Boolean(id) && caregiver.data?.centerId === user?.centerId
  })
  const archive = useMutation({
    mutationFn: () => removeCaregiver(id, caregiver.data!.version),
    onSuccess: async () => {
      setConfirmArchiveOpen(false)
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
      <section className='overflow-hidden rounded-2xl border border-outline-variant/40 bg-white'>
        <div className='h-2 bg-primary' />
        <div className='p-5 sm:p-7'>
          <div className='flex flex-wrap items-start justify-between gap-5'>
            <div className='flex min-w-0 flex-wrap items-center gap-5'>
              <span className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-primary sm:h-28 sm:w-28'>
                <Avatar
                  className='h-full w-full'
                  icon='person'
                  name={caregiver.data.fullName}
                  onExpired={() => void avatarMedia.refetch()}
                  src={pickAvatar(avatarMedia.data)?.downloadUrl}
                />
              </span>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='text-2xl font-extrabold tracking-tight'>{caregiver.data.fullName}</h1>
                  <ProviderStatusBadge
                    label={t(`${key}.${statusLabels[caregiver.data.caregiverStatus]}`)}
                    status={caregiver.data.caregiverStatus}
                  />
                </div>
                {caregiver.data.ratingAverage !== undefined ? (
                  <p className='mt-2 flex items-center gap-1 text-sm font-semibold tabular-nums'>
                    <Icon className='text-warning' filled name='star' />
                    {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(
                      caregiver.data.ratingAverage
                    )}
                    <span className='ml-2 font-normal text-outline'>
                      {t('centerManager.provider.reviewsValue', { count: caregiver.data.ratingCount ?? 0 })}
                    </span>
                  </p>
                ) : null}
                <div className='mt-3'>
                  <ProviderStatusBadge
                    label={t(`${key}.${verificationLabels[caregiver.data.verificationStatus]}`)}
                    status={caregiver.data.verificationStatus}
                  />
                </div>
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
                onClick={() => setConfirmArchiveOpen(true)}
                type='button'
              >
                <Icon name='block' />
                {t(`${key}.archive`)}
              </button>
            </div>
          </div>
          {archive.isError ? (
            <p className='mt-4 text-error' role='alert'>
              {t(apiRequestErrorKey(archive.error, `${key}.actionError`))}
            </p>
          ) : null}
        </div>
      </section>
      <ConfirmDialog
        confirmLabel={t(`${key}.archive`)}
        description={t(`${key}.confirmArchive`)}
        loading={archive.isPending}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={() => archive.mutate()}
        open={confirmArchiveOpen}
        title={t(`${key}.archive`)}
        tone='danger'
      />
      <div className='grid overflow-hidden rounded-2xl border border-outline-variant/40 bg-white sm:grid-cols-2 xl:grid-cols-4'>
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
              t(`${key}.birthDate`),
              caregiver.data.dateOfBirth
                ? formatProviderDate(caregiver.data.dateOfBirth, i18n.language)
                : t(`${key}.unknown`),
              'calendar_month'
            ],
            [
              t(`${key}.gender`),
              caregiver.data.gender ? t(`${key}.${genderOptions[caregiver.data.gender]}`) : t(`${key}.unknown`),
              'wc'
            ],
            [t(`${key}.centerName`), caregiver.data.centerName || t(`${key}.unknown`), 'home_health']
          ] as const
        ).map(([label, value, icon]) => (
          <section
            className='border-b border-outline-variant/30 p-5 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0'
            key={label}
          >
            <div className='flex items-center justify-between gap-2'>
              <h2 className='text-xs font-semibold text-outline'>{label}</h2>
              <Icon className='text-2xl text-primary' name={icon} />
            </div>
            <p className='mt-4 text-xl font-bold text-on-surface'>{value}</p>
          </section>
        ))}
      </div>
      {editing ? (
        <CaregiverEditor key={caregiver.data.version} onDone={() => setEditing(false)} person={caregiver.data} />
      ) : null}
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='space-y-6 lg:col-span-5'>
          <section className='rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-7'>
            <h2 className='flex items-center gap-2 text-lg font-bold'>
              <Icon className='text-primary' name='person' />
              {t(`${key}.profileTitle`)}
            </h2>
            <p className='mt-4 text-sm leading-7 text-on-surface-variant'>
              {caregiver.data.bio || t(`${key}.unknown`)}
            </p>
          </section>
          <CaregiverServicesEditor caregiverId={id} centerId={caregiver.data.centerId} />
        </div>
        <div className='lg:col-span-7'>
          <ManagerCertificates caregiverId={id} />
          <CaregiverTimeOffs caregiverId={id} copy='centerManager.provider.timeOff' />
        </div>
      </div>
    </main>
  )
}
