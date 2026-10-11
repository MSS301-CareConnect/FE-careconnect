import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import { PasswordField } from './password-field'
import { validPassword } from './password-validation'
import { homeForUser } from './role-path'
import { isForbiddenError, loadSession, sessionQueryKey } from './session-api'
import { changePassword, signOutEverywhere } from './security-api'

export function SecurityPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => window.location.replace('/login'),
    onError: () => setMessage(t('auth.security.actionError'))
  })
  const logout = useMutation({
    mutationFn: signOutEverywhere,
    onSuccess: () => window.location.replace('/login'),
    onError: () => setMessage(t('auth.security.actionError'))
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
      <main className='grid min-h-screen place-items-center' role='status'>
        {t('auth.loading')}
      </main>
    )
  if (session.isError)
    return (
      <main className='grid min-h-screen place-items-center p-6' role='alert'>
        <div>
          <p>{t(isForbiddenError(session.error) ? 'auth.forbiddenDescription' : 'auth.unavailableDescription')}</p>
          <button className='mt-3 underline' onClick={() => void session.refetch()} type='button'>
            {t('auth.retry')}
          </button>
        </div>
      </main>
    )
  if (!session.data) return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname)}`} />
  if (session.data.status !== 'ACTIVE')
    return (
      <main className='grid min-h-screen place-items-center' role='alert'>
        {t('auth.forbiddenDescription')}
      </main>
    )
  return (
    <main className='mx-auto max-w-xl space-y-6 p-6 sm:p-10'>
      <Link className='text-primary underline' to={homeForUser(session.data) ?? '/'}>
        {t('auth.security.back')}
      </Link>
      <h1 className='text-2xl font-bold'>{t('auth.security.title')}</h1>
      {message && (
        <p role='alert' className='rounded-lg bg-error-container p-3'>
          {message}
        </p>
      )}
      <form className='space-y-4 rounded-xl border border-outline-variant bg-white p-5' onSubmit={submit}>
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
        <button
          className='rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50'
          disabled={change.isPending || logout.isPending}
          type='submit'
        >
          {change.isPending ? t('auth.security.processing') : t('auth.security.changePassword')}
        </button>
      </form>
      <button
        className='rounded-lg border border-error px-4 py-2 font-semibold text-error disabled:opacity-50'
        disabled={logout.isPending || change.isPending}
        onClick={() => {
          if (window.confirm(t('auth.security.confirmLogoutAll'))) {
            setMessage('')
            logout.mutate()
          }
        }}
        type='button'
      >
        {logout.isPending ? t('auth.security.processing') : t('auth.security.logoutAll')}
      </button>
    </main>
  )
}
