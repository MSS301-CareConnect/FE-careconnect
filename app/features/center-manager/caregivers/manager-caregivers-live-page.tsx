import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { createCaregiver, fetchCaregivers, providerKeys } from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { provisionCaregiverAccount } from './caregiver-onboarding-api'

const key = 'centerManager.provider' as const
const inputClass =
  'mt-1.5 min-h-11 w-full rounded-xl border border-outline-variant/60 bg-white px-3.5 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const genderOptions = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const
const verificationOptions = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
const statusOptions = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const

export function CreateCaregiver({ centerId, onDone }: { centerId: string; onDone: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [accountId, setAccountId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bio, setBio] = useState('')
  const create = useMutation({
    mutationFn: async () => {
      const userId =
        accountId ?? (await provisionCaregiverAccount(email.trim(), fullName.trim(), phoneNumber.trim() || undefined))
      setAccountId(userId)
      return createCaregiver(centerId, {
        userId,
        fullName: fullName.trim(),
        experienceYears,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        bio: bio.trim() || undefined
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(centerId) })
      onDone()
    }
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }
  return (
    <form className='space-y-4 rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-xl' onSubmit={submit}>
      <h2 className='text-lg font-bold text-on-surface'>{t(`${key}.createCaregiver`)}</h2>
      <p className='text-sm text-on-surface-variant'>{t(`${key}.createCaregiverHint`)}</p>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='text-sm'>
          {t(`${key}.email`)}
          <input
            className={inputClass}
            disabled={Boolean(accountId)}
            onChange={(event) => setEmail(event.target.value)}
            required
            type='email'
            value={email}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.caregiverName`)}
          <input
            className={inputClass}
            disabled={Boolean(accountId)}
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.phoneNumber`)}
          <input
            className={inputClass}
            disabled={Boolean(accountId)}
            inputMode='numeric'
            onChange={(event) => setPhoneNumber(event.target.value)}
            pattern='[0-9]{10,11}'
            type='tel'
            value={phoneNumber}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.experience`)}
          <input
            className={inputClass}
            max={80}
            min={0}
            onChange={(event) => setExperienceYears(Number(event.target.value))}
            required
            type='number'
            value={experienceYears}
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
            onChange={(event) => setDateOfBirth(event.target.value)}
            type='date'
            value={dateOfBirth}
          />
        </label>
        <label className='text-sm sm:col-span-2'>
          {t(`${key}.bio`)}
          <textarea className={inputClass} onChange={(event) => setBio(event.target.value)} value={bio} />
        </label>
      </div>
      {create.isError ? (
        <p role='alert'>
          {accountId ? t(`${key}.profileAfterAccountError`) : t(apiRequestErrorKey(create.error, `${key}.actionError`))}
        </p>
      ) : null}
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
          disabled={create.isPending}
          type='submit'
        >
          {t(accountId ? `${key}.retryProfile` : `${key}.save`)}
        </button>
        <button
          className='rounded-lg border px-4 py-2 disabled:opacity-50'
          disabled={Boolean(accountId) || create.isPending}
          onClick={onDone}
          type='button'
        >
          {t(`${key}.cancel`)}
        </button>
      </div>
    </form>
  )
}

export function ManagerCaregiversPage() {
  const { t } = useTranslation()
  const user = useAuthUser()
  const centerId = user?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const verification = params.get('verification')
  const status = params.get('status')
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), page, verification, status],
    queryFn: () =>
      fetchCaregivers(centerId, {
        page,
        size: 20,
        verification:
          verification === 'PENDING' || verification === 'VERIFIED' || verification === 'REJECTED'
            ? verification
            : undefined,
        status:
          status === 'ACTIVE' || status === 'INACTIVE' || status === 'SUSPENDED' || status === 'ARCHIVED'
            ? status
            : undefined
      }),
    enabled: Boolean(centerId),
    retry: false
  })
  useDocumentTitle(t(`${key}.caregiversTitle`))
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }
  if (!centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noCenter`)}
      </main>
    )
  return (
    <main className='mx-auto max-w-6xl space-y-6 p-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold'>{t(`${key}.caregiversTitle`)}</h1>
        <button className='rounded-lg bg-primary px-4 py-2 text-white' onClick={() => setCreating(true)} type='button'>
          {t(`${key}.createCaregiver`)}
        </button>
      </header>
      {creating ? <CreateCaregiver centerId={centerId} onDone={() => setCreating(false)} /> : null}
      <div className='flex flex-wrap gap-4'>
        <label className='text-sm'>
          {t(`${key}.verification`)}
          <select
            className={inputClass}
            onChange={(event) => update('verification', event.target.value)}
            value={verification ?? ''}
          >
            <option value=''>{t(`${key}.all`)}</option>
            {(
              Object.entries(verificationOptions) as [
                keyof typeof verificationOptions,
                (typeof verificationOptions)[keyof typeof verificationOptions]
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`${key}.${label}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='text-sm'>
          {t(`${key}.status`)}
          <select
            className={inputClass}
            onChange={(event) => update('status', event.target.value)}
            value={status ?? ''}
          >
            <option value=''>{t(`${key}.all`)}</option>
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
      </div>
      {caregivers.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {caregivers.isError ? (
        <div role='alert'>
          <p>{t(`${key}.caregiversError`)}</p>
          <button className='text-primary underline' onClick={() => void caregivers.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {caregivers.isSuccess ? (
        <section className='rounded-xl border border-outline-variant bg-white'>
          {caregivers.data.items.length === 0 ? (
            <p className='p-5'>{t(`${key}.caregiversEmpty`)}</p>
          ) : (
            <ul className='divide-y divide-outline-variant'>
              {caregivers.data.items.map((person) => (
                <li className='flex flex-wrap items-center justify-between gap-3 p-4' key={person.id}>
                  <div>
                    <strong>{person.fullName}</strong>
                    <p className='text-sm text-outline'>
                      {t(`${key}.${verificationOptions[person.verificationStatus]}`)} ·{' '}
                      {t(`${key}.${statusOptions[person.caregiverStatus]}`)}
                    </p>
                  </div>
                  <Link className='text-primary underline' to={`/center-manager/caregivers/${person.id}`}>
                    {t(`${key}.viewDetails`, { name: person.fullName })}
                  </Link>
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
    </main>
  )
}
