import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { saveMyProfile } from './profile-api'

const inputClass =
  'mt-2 h-12 w-full rounded-lg bg-surface-container-low px-4 outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/30'

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
    <form className='mt-7 grid gap-5 sm:grid-cols-2' onSubmit={handleSubmit}>
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
      <div className='sm:col-span-2'>
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
        <p className='text-sm text-error sm:col-span-2' role='alert'>
          {t(validationError)}
        </p>
      )}
      {update.isError && (
        <p className='text-sm text-error sm:col-span-2' role='alert'>
          {t('customer.profile.live.saveFailed')}
        </p>
      )}
      {update.isSuccess && !validationError && (
        <p className='text-sm text-primary sm:col-span-2' role='status'>
          {t('customer.profile.form.saveSuccess')}
        </p>
      )}
      <div className='flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant/25 pt-5 sm:col-span-2'>
        <button
          className='order-2 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:opacity-60 sm:order-1'
          disabled={update.isPending}
          type='submit'
        >
          <Icon name='save' />
          {update.isPending ? t('customer.profile.form.saving') : t('customer.profile.form.saveChanges')}
        </button>
        <button
          className='order-1 rounded-lg bg-surface-container-low px-6 py-3 font-semibold sm:order-0'
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
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  useDocumentTitle(t('customer.profile.documentTitle'))

  if (!user)
    return (
      <main className='mx-auto max-w-3xl px-6 py-12' role='status'>
        {t('auth.loading')}
      </main>
    )

  const name = user.fullName || user.email || t('customer.nav.userName')
  const initials =
    user.fullName
      ?.split(/\s+/)
      .slice(-2)
      .map((part) => part[0])
      .join('')
      .toLocaleUpperCase() || 'CC'
  const memberSince =
    user.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { month: 'long', year: 'numeric' }).format(
          new Date(user.createdAt)
        )
      : null

  return (
    <main className='mx-auto max-w-7xl space-y-7 px-4 py-8 text-on-surface sm:px-6'>
      <nav
        aria-label={t('customer.profile.breadcrumb.personalInfo')}
        className='flex items-center gap-2 text-xs text-on-surface-variant'
      >
        <Link className='inline-flex items-center gap-1 hover:text-primary' to='/customer'>
          <Icon className='text-base' name='home' />
          {t('customer.profile.breadcrumb.home')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <span>{t('customer.profile.breadcrumb.myAccount')}</span>
        <Icon className='text-sm' name='chevron_right' />
        <span className='font-semibold text-primary'>{t('customer.profile.breadcrumb.personalInfo')}</span>
      </nav>
      <header>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
          <Icon className='text-sm' name='account_circle' />
          {t('customer.profile.live.customerAccount')}
        </span>
        <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>{t('customer.profile.header.title')}</h1>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>
          {t('customer.profile.live.description')}
        </p>
      </header>
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <aside className='space-y-5 lg:col-span-4'>
          <section
            aria-label={t('customer.profile.live.overviewTitle')}
            className='relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm'
          >
            <div className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-secondary-container/50 blur-2xl' />
            <div className='relative flex flex-col items-center text-center'>
              <span
                aria-hidden='true'
                className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-secondary-container bg-primary text-3xl font-bold text-white shadow-sm'
              >
                {initials}
              </span>
              <h2 className='mt-4 text-lg font-bold'>{name}</h2>
              <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.nav.customerRole')}</p>
              {memberSince && (
                <p className='mt-2 rounded-md bg-surface-container-low px-2 py-1 text-xs text-on-surface-variant'>
                  {t('customer.profile.live.memberSince', { date: memberSince })}
                </p>
              )}
              <div className='mt-6 w-full space-y-3 rounded-xl bg-surface-container-low p-4 text-left text-sm'>
                <div className='flex items-start gap-3'>
                  <Icon className='text-lg text-primary' name='mail' />
                  <span className='min-w-0 break-all'>{user.email}</span>
                </div>
                <div className='flex items-start gap-3'>
                  <Icon className='text-lg text-primary' name='call' />
                  <span>{user.phoneNumber || t('customer.profile.live.notProvided')}</span>
                </div>
              </div>
            </div>
          </section>
          <nav aria-label={t('customer.profile.nav.title')} className='rounded-2xl bg-white p-3 shadow-sm'>
            <h2 className='px-3 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
              {t('customer.profile.nav.title')}
            </h2>
            <a
              className='flex items-center gap-3 rounded-xl bg-secondary-container/50 px-3 py-3 text-sm font-semibold text-primary'
              href='#personal-info'
            >
              <Icon name='person' />
              {t('customer.profile.nav.personalInfo')}
            </a>
            <Link
              className='flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low'
              to='/account/security'
            >
              <Icon name='lock_reset' />
              {t('customer.profile.nav.security')}
            </Link>
            <Link
              className='flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low'
              to='/customer/patient-profiles'
            >
              <Icon name='family_restroom' />
              {t('customer.profile.nav.familyProfiles')}
            </Link>
            <Link
              className='flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low'
              to='/customer/bookings'
            >
              <Icon name='calendar_month' />
              {t('customer.profile.nav.bookingHistory')}
            </Link>
          </nav>
        </aside>
        <div className='space-y-5 lg:col-span-8'>
          <section className='rounded-2xl bg-white p-6 shadow-sm sm:p-8' id='personal-info'>
            <div className='flex items-center gap-3 border-b border-outline-variant/25 pb-5'>
              <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-primary'>
                <Icon name='badge' />
              </span>
              <div>
                <h2 className='text-xl font-bold'>{t('customer.profile.form.title')}</h2>
                <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.profile.live.formHint')}</p>
              </div>
            </div>
            <ProfileForm key={user.id} user={user} />
          </section>
          <section className='flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-4'>
              <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary'>
                <Icon name='shield_lock' />
              </span>
              <div>
                <h2 className='font-bold'>{t('auth.security.title')}</h2>
                <p className='mt-1 text-sm text-on-surface-variant'>{t('customer.profile.live.securityHint')}</p>
              </div>
            </div>
            <Link
              className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white'
              to='/account/security'
            >
              {t('customer.profile.live.openSecurity')}
              <Icon name='arrow_forward' />
            </Link>
          </section>
          <section className='flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-4'>
              <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary'>
                <Icon name='family_restroom' />
              </span>
              <div>
                <h2 className='font-bold'>{t('customer.profile.nav.familyProfiles')}</h2>
                <p className='mt-1 text-sm text-on-surface-variant'>{t('customer.profile.live.familyHint')}</p>
              </div>
            </div>
            <Link
              className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-primary'
              to='/customer/patient-profiles'
            >
              {t('customer.profile.familyInsight.viewDetails')}
              <Icon name='arrow_forward' />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
