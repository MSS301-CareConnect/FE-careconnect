import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { saveMyProfile } from './profile-api'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-outline-variant bg-white px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary'

function ProfileForm({ user }: { user: UserResponse }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '')
  const [validationError, setValidationError] = useState<
    'customer.profile.live.invalidName' | 'customer.profile.live.invalidPhone' | null
  >(null)
  const update = useMutation({
    mutationFn: saveMyProfile,
    onSuccess: (saved) => {
      queryClient.setQueryData(sessionQueryKey, saved)
      setFullName(saved.fullName ?? '')
      setPhoneNumber(saved.phoneNumber ?? '')
      setValidationError(null)
    }
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = fullName.trim()
    const phone = phoneNumber.trim()
    if (!name || name.length > 255) {
      setValidationError('customer.profile.live.invalidName')
      return
    }
    if ((phone || user.phoneNumber) && !/^[0-9]{10,11}$/.test(phone)) {
      setValidationError('customer.profile.live.invalidPhone')
      return
    }
    setValidationError(null)
    update.mutate({ fullName: name, ...(phone ? { phoneNumber: phone } : {}) })
  }

  return (
    <form className='mt-7 space-y-5' onSubmit={handleSubmit}>
      <div>
        <label className='block text-sm font-semibold' htmlFor='profile-name'>
          {t('customer.profile.form.fullName')}
        </label>
        <input
          className={inputClass}
          id='profile-name'
          maxLength={255}
          onChange={(event) => {
            setFullName(event.target.value)
            update.reset()
          }}
          required
          value={fullName}
        />
      </div>
      <div>
        <label className='block text-sm font-semibold' htmlFor='profile-phone'>
          {t('customer.profile.form.phone')}
        </label>
        <input
          autoComplete='tel'
          className={inputClass}
          id='profile-phone'
          inputMode='tel'
          onChange={(event) => {
            setPhoneNumber(event.target.value)
            update.reset()
          }}
          value={phoneNumber}
        />
      </div>
      <div>
        <label className='block text-sm font-semibold' htmlFor='profile-email'>
          {t('customer.profile.live.accountEmail')}
        </label>
        <input
          className={`${inputClass} bg-surface-container-low`}
          id='profile-email'
          readOnly
          value={user.email ?? ''}
        />
        <p className='mt-2 text-xs text-on-surface-variant'>{t('customer.profile.live.emailReadOnly')}</p>
      </div>
      {validationError && (
        <p className='text-sm text-error' role='alert'>
          {t(validationError)}
        </p>
      )}
      {update.isError && (
        <p className='text-sm text-error' role='alert'>
          {t('customer.profile.live.saveFailed')}
        </p>
      )}
      {update.isSuccess && !validationError && (
        <p className='text-sm text-primary' role='status'>
          {t('customer.profile.form.saveSuccess')}
        </p>
      )}
      <div className='flex flex-wrap items-center gap-3 pt-2'>
        <button
          className='rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:opacity-60'
          disabled={update.isPending}
          type='submit'
        >
          {update.isPending ? t('customer.profile.form.saving') : t('customer.profile.form.saveChanges')}
        </button>
        <button
          className='rounded-xl border border-outline-variant px-6 py-3 font-semibold'
          onClick={() => {
            setFullName(user.fullName ?? '')
            setPhoneNumber(user.phoneNumber ?? '')
            setValidationError(null)
            update.reset()
          }}
          type='button'
        >
          {t('customer.profile.form.cancel')}
        </button>
      </div>
    </form>
  )
}

export function MyProfilePage() {
  const { t } = useTranslation()
  const user = useAuthUser()
  useDocumentTitle(t('customer.profile.documentTitle'))

  if (!user)
    return (
      <main className='mx-auto max-w-3xl px-6 py-12' role='status'>
        {t('auth.loading')}
      </main>
    )

  return (
    <main className='mx-auto max-w-3xl px-6 py-10 text-on-surface'>
      <h1 className='text-3xl font-bold tracking-tight'>{t('customer.profile.header.title')}</h1>
      <p className='mt-2 text-on-surface-variant'>{t('customer.profile.live.description')}</p>
      <section className='mt-8 rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm sm:p-8'>
        <h2 className='text-xl font-bold'>{t('customer.profile.form.title')}</h2>
        <ProfileForm key={user.id} user={user} />
      </section>
      <p className='mt-6 text-sm text-on-surface-variant'>
        {t('customer.profile.live.passwordHelp')}{' '}
        <Link className='font-semibold text-primary underline-offset-4 hover:underline' to='/forgot-password'>
          {t('auth.recovery.title')}
        </Link>
      </p>
      <Link
        className='mt-4 inline-block font-semibold text-primary underline-offset-4 hover:underline'
        to='/account/security'
      >
        {t('auth.security.title')}
      </Link>
    </main>
  )
}
