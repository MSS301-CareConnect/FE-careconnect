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
      <main
        className='grid min-h-screen place-items-center bg-surface p-6 text-sm font-medium text-on-surface-variant'
        role='status'
      >
        {t('auth.loading')}
      </main>
    )
  }

  if (session.isError) {
    return (
      <main className='grid min-h-screen place-items-center bg-surface p-6'>
        <div className='max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-bold text-on-surface'>{t('auth.unavailableTitle')}</h1>
          <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t('auth.unavailableDescription')}</p>
          <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
            <Link className='inline-flex items-center gap-2 font-semibold text-primary hover:underline' to='/'>
              <Icon name='arrow_back' />
              {t('auth.backHome')}
            </Link>
            <button
              className='rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
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
    <main className='grid min-h-dvh bg-surface text-on-surface lg:h-dvh lg:min-h-[640px] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,.92fr)]'>
      <aside className='relative isolate min-h-36 overflow-hidden bg-inverse-surface sm:min-h-44 lg:min-h-0'>
        <img
          alt=''
          aria-hidden='true'
          className='absolute inset-0 h-full w-full object-cover object-center lg:object-[center_45%]'
          src='/images/login-care-moment.jpg'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/20 to-transparent lg:from-inverse-surface/92 lg:via-inverse-surface/15' />
        <div className='relative flex h-full min-h-36 flex-col justify-between px-5 py-5 text-inverse-on-surface sm:min-h-44 sm:px-10 lg:min-h-0 lg:px-12 lg:py-10'>
          <Link
            className='inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/25 bg-inverse-surface/75 px-4 text-sm font-semibold text-white transition-colors hover:bg-inverse-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            to='/'
          >
            <Icon className='text-lg' name='arrow_back' />
            {t('auth.backHome')}
          </Link>
          <div className='hidden max-w-lg lg:block'>
            <span className='inline-flex items-center gap-2 rounded-full border border-white/35 bg-inverse-surface/55 px-4 py-2 text-xs font-bold tracking-[0.13em] uppercase'>
              <Icon aria-hidden='true' className='text-base' name='favorite' />
              {t('auth.visualLabel')}
            </span>
            <h2 className='mt-5 text-[clamp(2.25rem,3.1vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.045em]'>
              {t('auth.visualHeadline')}
            </h2>
            <p className='mt-3 max-w-md text-base leading-7 text-inverse-muted'>{t('auth.visualDescription')}</p>
          </div>
        </div>
      </aside>

      <div className='flex min-w-0 flex-col bg-surface-container-lowest px-5 py-6 sm:px-10 lg:px-12 lg:py-8 xl:px-20'>
        <div className='flex w-full items-center justify-between gap-4'>
          <Link className='text-xl font-bold tracking-[-0.04em] text-primary sm:text-2xl' to='/'>
            {t('common.brand')}
          </Link>
          <LanguageSwitch />
        </div>

        <div className='flex w-full flex-1 flex-col justify-center py-7 lg:min-h-0 lg:py-4'>
          <div className='w-full max-w-[460px] self-center'>
            <h1 className='text-[clamp(2.1rem,2.7vw,2.8rem)] font-bold leading-[1.12] tracking-[-0.045em] text-on-surface'>
              {t('auth.loginTitle')}
            </h1>
            <p className='mt-2 text-base leading-7 text-on-surface-variant'>{t('auth.loginDescription')}</p>
            <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
              <div>
                <label className='block text-sm font-semibold text-on-surface' htmlFor='login-email'>
                  {t('auth.email')}
                </label>
                <input
                  autoComplete='username'
                  className='mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'
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
                <p
                  className='rounded-xl border border-error/25 bg-error-container p-3.5 text-sm font-medium text-on-error-container'
                  role='alert'
                >
                  {t('auth.noPortal')}
                </p>
              )}
              {login.isError && (
                <p
                  className='rounded-xl border border-error/25 bg-error-container p-3.5 text-sm font-medium text-on-error-container'
                  role='alert'
                >
                  {t(isCredentialError(login.error) ? 'auth.invalidCredentials' : 'auth.loginFailed')}
                </p>
              )}
              <button
                aria-busy={login.isPending}
                className='h-12 w-full rounded-xl bg-primary font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60'
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
        </div>
      </div>
    </main>
  )
}
