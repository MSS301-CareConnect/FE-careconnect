import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { AuthTextField, AuthMessage } from './auth-form-parts'
import { authDescription, authSubmit, authTitle } from './auth-styles'
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

  return (
    <>
      {session.isPending ? (
        <p
          className='flex items-center justify-center gap-2.5 py-16 text-sm font-medium text-forest-800/70'
          role='status'
        >
          <span
            aria-hidden='true'
            className='h-4 w-4 animate-spin rounded-full border-2 border-forest-900/15 border-t-forest-900'
          />
          {t('auth.loading')}
        </p>
      ) : session.isError ? (
        <div className='py-8 text-center'>
          <span
            aria-hidden='true'
            className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-peach-100 text-peach-700'
          >
            <Icon className='text-2xl' name='wifi_off' />
          </span>
          <h1 className='mt-5 text-2xl font-bold tracking-tight text-forest-950'>{t('auth.unavailableTitle')}</h1>
          <p className={authDescription}>{t('auth.unavailableDescription')}</p>
          <button className={`${authSubmit} mt-7`} onClick={() => void session.refetch()} type='button'>
            <Icon className='text-lg' name='refresh' />
            {t('auth.retry')}
          </button>
        </div>
      ) : (
        <>
          <h1 className={authTitle}>{t('auth.loginTitle')}</h1>
          <p className={authDescription}>{t('auth.loginDescription')}</p>
          <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
            <AuthTextField
              autoComplete='username'
              icon='mail'
              id='login-email'
              label={t('auth.email')}
              onChange={(event) => setEmail(event.target.value)}
              required
              type='email'
              value={email}
            />
            <PasswordField
              action={
                <Link
                  className='text-xs font-semibold text-forest-700 hover:text-forest-950 hover:underline transition-colors focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                  to='/forgot-password'
                >
                  {t('auth.recovery.title')}
                </Link>
              }
              autoComplete='current-password'
              id='login-password'
              label={t('auth.password')}
              onChange={setPassword}
              value={password}
              variant='auth'
            />
            {login.data && !homeForUser(login.data) ? (
              <AuthMessage tone='error'>{t('auth.noPortal')}</AuthMessage>
            ) : null}
            {login.isError ? (
              <AuthMessage tone='error'>
                {t(isCredentialError(login.error) ? 'auth.invalidCredentials' : 'auth.loginFailed')}
              </AuthMessage>
            ) : null}
            <button
              aria-busy={login.isPending}
              className={`${authSubmit} mt-2`}
              disabled={login.isPending}
              type='submit'
            >
              {login.isPending ? t('auth.signingIn') : t('auth.signIn')}
              {login.isPending ? null : <Icon className='text-lg' name='arrow_forward' />}
            </button>
          </form>
          <p className='mt-6 text-center text-sm text-forest-800/70'>
            {t('auth.registration.needAccount')}{' '}
            <Link className='font-bold text-forest-950 hover:underline underline-offset-4' to='/register'>
              {t('auth.shell.registerTab')}
            </Link>
          </p>
        </>
      )}
    </>
  )
}
