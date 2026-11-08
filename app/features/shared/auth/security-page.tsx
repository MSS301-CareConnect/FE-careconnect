import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Link, Navigate, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { ConfirmDialog } from '~/shared/ui/modal'

import { PasswordField } from './password-field'
import { validPassword } from '~/entities/identity/password-rules'
import { homeForUser } from './role-path'
import { isForbiddenError, loadSession, sessionQueryKey } from './session-api'
import { changePassword, signOutEverywhere } from './security-api'
import { SecuritySessions } from './security-sessions'

export function SecurityPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false)
  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => window.location.replace('/login'),
    onError: (error) => setMessage(t(apiRequestErrorKey(error, 'auth.security.actionError')))
  })
  const logout = useMutation({
    mutationFn: signOutEverywhere,
    onSuccess: () => window.location.replace('/login'),
    onError: (error) => {
      setConfirmSignOutAll(false)
      setMessage(t(apiRequestErrorKey(error, 'auth.security.actionError')))
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!validPassword(newPassword)) {
      setMessage(t('auth.security.invalidPassword'))
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage(t('auth.security.passwordMismatch'))
      return
    }
    change.mutate()
  }

  if (session.isPending)
    return (
      <main
        className='grid min-h-screen place-items-center bg-surface text-sm font-medium text-on-surface-variant'
        role='status'
      >
        {t('auth.loading')}
      </main>
    )
  if (session.isError)
    return (
      <main className='grid min-h-screen place-items-center bg-surface p-6' role='alert'>
        <div className='max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-center shadow-sm'>
          <p className='text-sm text-on-surface'>
            {t(isForbiddenError(session.error) ? 'auth.forbiddenDescription' : 'auth.unavailableDescription')}
          </p>
          <button
            className='mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container'
            onClick={() => void session.refetch()}
            type='button'
          >
            {t('auth.retry')}
          </button>
        </div>
      </main>
    )
  if (!session.data) return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname)}`} />
  if (session.data.status !== 'ACTIVE')
    return (
      <main className='grid min-h-screen place-items-center bg-surface p-6 text-on-surface' role='alert'>
        {t('auth.forbiddenDescription')}
      </main>
    )

  const portalHome = homeForUser(session.data) ?? '/'
  const displayName = session.data.fullName || session.data.email || t('common.brand')

  return (
    <div className='min-h-screen bg-surface text-on-surface'>
      <header className='sticky top-0 z-30 border-b border-outline-variant/50 bg-surface-container-lowest/95 backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6'>
          <div className='flex items-center gap-4'>
            <Link className='text-lg font-bold tracking-tight text-primary' to={portalHome}>
              {t('common.brand')}
            </Link>
            <span aria-hidden='true' className='h-4 w-px bg-outline-variant/60' />
            <Link
              className='inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary'
              to={portalHome}
            >
              <Icon className='text-base' name='arrow_back' />
              {t('auth.security.back')}
            </Link>
          </div>
          <div className='flex items-center gap-3'>
            <span className='hidden max-w-48 truncate rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant sm:inline-block'>
              {displayName}
            </span>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>{t('auth.security.title')}</h1>
          <p className='mt-1.5 text-sm leading-6 text-on-surface-variant'>{t('auth.security.subtitle')}</p>
        </div>

        {message && (
          <p
            role='alert'
            className='rounded-xl border border-error/25 bg-error-container p-3.5 text-sm font-medium text-on-error-container'
          >
            {message}
          </p>
        )}

        <form
          className='space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs'
          onSubmit={submit}
        >
          <div className='flex items-center gap-2.5'>
            <span className='grid h-9 w-9 place-items-center rounded-xl bg-primary-fixed/60 text-primary'>
              <Icon className='text-lg' name='lock_reset' />
            </span>
            <div>
              <h2 className='text-lg font-bold text-on-surface'>{t('auth.security.passwordSectionTitle')}</h2>
              <p className='text-xs text-on-surface-variant'>{t('auth.security.passwordHint')}</p>
            </div>
          </div>

          <PasswordField
            autoComplete='current-password'
            id='currentPassword'
            label={t('auth.security.currentPassword')}
            onChange={setCurrentPassword}
            value={currentPassword}
          />
          <PasswordField
            autoComplete='new-password'
            id='newPassword'
            label={t('auth.security.newPassword')}
            onChange={setNewPassword}
            value={newPassword}
          />
          <PasswordField
            autoComplete='new-password'
            id='confirmPassword'
            label={t('auth.security.confirmPassword')}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
          <div className='pt-1'>
            <button
              aria-busy={change.isPending}
              className='min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
              disabled={change.isPending || logout.isPending}
              type='submit'
            >
              {change.isPending ? t('auth.security.processing') : t('auth.security.changePassword')}
            </button>
          </div>
        </form>

        <SecuritySessions />

        <section className='flex flex-col justify-between gap-4 rounded-2xl border border-error/30 bg-error-container/35 p-6 sm:flex-row sm:items-center'>
          <div className='space-y-1'>
            <h2 className='text-base font-bold text-on-surface'>{t('auth.security.dangerZoneTitle')}</h2>
            <p className='text-xs leading-5 text-on-surface-variant'>{t('auth.security.dangerZoneDescription')}</p>
          </div>
          <button
            className='min-h-10 shrink-0 rounded-xl border border-error bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-on-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-50'
            disabled={logout.isPending || change.isPending}
            onClick={() => setConfirmSignOutAll(true)}
            type='button'
          >
            {logout.isPending ? t('auth.security.processing') : t('auth.security.logoutAll')}
          </button>
        </section>

        <ConfirmDialog
          confirmLabel={t('auth.security.logoutAll')}
          description={t('auth.security.dangerZoneDescription')}
          loading={logout.isPending}
          onClose={() => setConfirmSignOutAll(false)}
          onConfirm={() => {
            setMessage('')
            logout.mutate()
          }}
          open={confirmSignOutAll}
          title={t('auth.security.confirmLogoutAll')}
          tone='danger'
        />
      </main>
    </div>
  )
}
