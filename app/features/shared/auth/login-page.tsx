import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { PasswordField } from './password-field'
import { homeForUser, safeReturnPath } from './role-path'
import { isCredentialError, loadSession, sessionQueryKey, signIn } from './session-api'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })
  const login = useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryKey, user)
      const destination = safeReturnPath(searchParams.get('next'), user) ?? homeForUser(user)
      if (destination) void navigate(destination, { replace: true })
    }
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate({ email: email.trim(), password })
  }

  if (session.data) {
    const destination = safeReturnPath(searchParams.get('next'), session.data) ?? homeForUser(session.data)
    if (destination) return <Navigate replace to={destination} />
  }

  if (session.isPending) {
    return (
      <main className='grid min-h-screen place-items-center p-6' role='status'>
        {t('auth.loading')}
      </main>
    )
  }

  if (session.isError) {
    return (
      <main className='grid min-h-screen place-items-center p-6'>
        <div className='max-w-md text-center'>
          <h1 className='text-2xl font-bold'>{t('auth.unavailableTitle')}</h1>
          <p className='mt-3 text-on-surface-variant'>{t('auth.unavailableDescription')}</p>
          <div className='mt-5 flex flex-wrap items-center justify-center gap-4'>
            <Link className='inline-flex items-center gap-2 font-semibold text-primary hover:underline' to='/'>
              <Icon name='arrow_back' />
              {t('auth.backHome')}
            </Link>
            <button
              className='rounded-xl bg-primary px-5 py-3 font-semibold text-white'
              onClick={() => void session.refetch()}
              type='button'
            >
              {t('auth.retry')}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-surface-container-low px-4 py-10 text-on-surface'>
      <div className='w-full max-w-md rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-lg sm:p-8'>
        <div className='flex items-center justify-between gap-3'>
          <Link className='text-lg font-bold text-primary' to='/'>
            {t('common.brand')}
          </Link>
          <LanguageSwitch />
        </div>
        <Link
          className='mt-8 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          to='/'
        >
          <Icon className='text-lg' name='arrow_back' />
          {t('auth.backHome')}
        </Link>
        <h1 className='mt-5 text-3xl font-bold tracking-tight'>{t('auth.loginTitle')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('auth.loginDescription')}</p>
        <form className='mt-7 space-y-5' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm font-semibold' htmlFor='login-email'>
              {t('auth.email')}
            </label>
            <input
              autoComplete='username'
              className='mt-2 h-12 w-full rounded-xl border border-outline-variant bg-white px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary'
              id='login-email'
              onChange={(event) => setEmail(event.target.value)}
              required
              type='email'
              value={email}
            />
          </div>
          <PasswordField
            autoComplete='current-password'
            id='login-password'
            label={t('auth.password')}
            onChange={setPassword}
            value={password}
          />
          <div className='text-right text-sm'>
            <Link className='font-semibold text-primary underline-offset-4 hover:underline' to='/forgot-password'>
              {t('auth.recovery.title')}
            </Link>
          </div>
          {login.data && !homeForUser(login.data) && (
            <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
              {t('auth.noPortal')}
            </p>
          )}
          {login.isError && (
            <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
              {t(isCredentialError(login.error) ? 'auth.invalidCredentials' : 'auth.loginFailed')}
            </p>
          )}
          <button
            className='h-12 w-full rounded-xl bg-primary font-bold text-white hover:opacity-90 disabled:opacity-60'
            disabled={login.isPending}
            type='submit'
          >
            {login.isPending ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
        <p className='mt-6 text-center text-sm text-on-surface-variant'>
          {t('auth.registration.needAccount')}{' '}
          <Link className='font-semibold text-primary underline-offset-4 hover:underline' to='/register'>
            {t('auth.registration.submit')}
          </Link>
        </p>
      </div>
    </main>
  )
}
