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
    <main className='grid min-h-dvh bg-[#f7f9f5] text-[#1b2922] lg:h-dvh lg:min-h-[640px] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,.92fr)]'>
      <aside className='relative isolate min-h-36 overflow-hidden bg-[#214632] sm:min-h-44 lg:min-h-0'>
        <img
          alt=''
          aria-hidden='true'
          className='absolute inset-0 h-full w-full object-cover object-center lg:object-[center_45%]'
          src='/images/login-care-moment.jpg'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-[#0e3123]/85 via-[#0e3123]/10 to-transparent lg:from-[#0e3123]/90 lg:via-[#0e3123]/10' />
        <div className='relative flex h-full min-h-36 flex-col justify-between px-5 py-5 text-white sm:min-h-44 sm:px-10 lg:min-h-0 lg:px-12 lg:py-10'>
          <Link
            className='inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/25 bg-[#123d2b]/75 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#123d2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            to='/'
          >
            <Icon className='text-lg' name='arrow_back' />
            {t('auth.backHome')}
          </Link>
          <div className='hidden max-w-lg lg:block'>
            <span className='inline-flex items-center gap-2 rounded-full border border-white/35 bg-[#123d2b]/50 px-4 py-2 text-xs font-bold tracking-[0.13em] uppercase'>
              <Icon aria-hidden='true' className='text-base' name='favorite' />
              {t('auth.visualLabel')}
            </span>
            <h2 className='mt-5 text-[clamp(2.25rem,3.1vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.045em]'>
              {t('auth.visualHeadline')}
            </h2>
            <p className='mt-3 max-w-md text-base leading-7 text-white/85'>{t('auth.visualDescription')}</p>
          </div>
        </div>
      </aside>

      <div className='flex min-w-0 flex-col bg-[#fbfcf9] px-5 py-6 sm:px-10 lg:px-12 lg:py-8 xl:px-20'>
        <div className='flex w-full items-center justify-between gap-4'>
          <Link className='text-xl font-bold tracking-[-0.04em] text-[#075b31] sm:text-2xl' to='/'>
            {t('common.brand')}
          </Link>
          <LanguageSwitch />
        </div>

        <div className='flex w-full flex-1 flex-col justify-center py-7 lg:min-h-0 lg:py-4'>
          <div className='w-full max-w-[460px] self-center'>
            <h1 className='text-[clamp(2.1rem,2.7vw,2.8rem)] font-bold leading-[1.12] tracking-[-0.045em]'>
              {t('auth.loginTitle')}
            </h1>
            <p className='mt-2 text-base leading-7 text-[#526659]'>{t('auth.loginDescription')}</p>
            <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
              <div>
                <label className='block text-sm font-semibold' htmlFor='login-email'>
                  {t('auth.email')}
                </label>
                <input
                  autoComplete='username'
                  className='mt-2 h-12 w-full rounded-xl border border-[#bfcfc0] bg-white px-4 outline-none transition-colors focus-visible:border-[#075b31] focus-visible:ring-2 focus-visible:ring-[#075b31]/20'
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
                className='h-12 w-full rounded-xl bg-[#075b31] font-bold text-white transition-colors hover:bg-[#064a29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31] disabled:opacity-60'
                disabled={login.isPending}
                type='submit'
              >
                {login.isPending ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>
            <p className='mt-6 text-center text-sm text-[#526659]'>
              {t('auth.registration.needAccount')}{' '}
              <Link className='font-semibold text-[#075b31] underline-offset-4 hover:underline' to='/register'>
                {t('auth.registration.submit')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
