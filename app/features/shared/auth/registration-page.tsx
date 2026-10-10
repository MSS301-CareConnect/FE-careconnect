import { useMutation } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { LanguageSwitch } from '~/shared/ui/language-switch'

import { PasswordField } from './password-field'
import { validPassword } from './password-validation'
import { beginRegistration, registrationErrorKey, resendOtp, verifyRegistration } from './registration-api'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-outline-variant bg-white px-4 text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary'

type ValidationKey =
  | 'auth.registration.invalidName'
  | 'auth.registration.invalidEmail'
  | 'auth.registration.invalidPhone'
  | 'auth.registration.passwordRules'
  | 'auth.registration.passwordMismatch'
  | 'auth.registration.invalidOtp'

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function RegistrationPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [validationError, setValidationError] = useState<ValidationKey | null>(null)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [resent, setResent] = useState(false)
  const [completed, setCompleted] = useState(false)
  const verifying = searchParams.get('step') === 'verify'

  const register = useMutation({
    mutationFn: beginRegistration,
    onSuccess: (result) => {
      setEmail(result.email)
      setPassword('')
      setConfirmPassword('')
      setValidationError(null)
      setResendSeconds(result.resendAfterSeconds)
      setSearchParams({ step: 'verify' })
    }
  })
  const verify = useMutation({
    mutationFn: verifyRegistration,
    onSuccess: () => {
      setOtpCode('')
      setCompleted(true)
    }
  })
  const resend = useMutation({
    mutationFn: resendOtp,
    onSuccess: (result) => {
      setResendSeconds(result.resendAfterSeconds)
      setResent(true)
      setValidationError(null)
    }
  })

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = fullName.trim()
    const address = email.trim()
    const phone = phoneNumber.trim()
    let error: ValidationKey | null = null
    if (!name || name.length > 255) error = 'auth.registration.invalidName'
    else if (!validEmail(address)) error = 'auth.registration.invalidEmail'
    else if (phone && !/^[0-9]{10,11}$/.test(phone)) error = 'auth.registration.invalidPhone'
    else if (!validPassword(password)) error = 'auth.registration.passwordRules'
    else if (password !== confirmPassword) error = 'auth.registration.passwordMismatch'
    setValidationError(error)
    if (error) return
    register.mutate({ fullName: name, email: address, password, ...(phone ? { phoneNumber: phone } : {}) })
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let error: ValidationKey | null = null
    if (!validEmail(email.trim())) error = 'auth.registration.invalidEmail'
    else if (!/^[0-9]{6}$/.test(otpCode)) error = 'auth.registration.invalidOtp'
    setValidationError(error)
    if (error) return
    verify.mutate({ email: email.trim(), otpCode })
  }

  function handleResend() {
    if (!validEmail(email.trim())) {
      setValidationError('auth.registration.invalidEmail')
      return
    }
    setValidationError(null)
    setResent(false)
    resend.mutate({ email: email.trim() })
  }

  return (
    <main className='min-h-screen bg-surface-container-low px-4 py-6 text-on-surface sm:px-6 lg:py-12'>
      <div className='mx-auto max-w-6xl'>
        <header className='mb-8 flex items-center justify-between gap-4'>
          <Link className='text-xl font-bold tracking-tight text-primary' to='/'>
            {t('common.brand')}
          </Link>
          <div className='flex items-center gap-4'>
            <LanguageSwitch />
            <Link className='text-sm font-semibold text-primary hover:underline' to='/login'>
              {t('auth.registration.signIn')}
            </Link>
          </div>
        </header>

        <div className='grid overflow-hidden rounded-3xl border border-outline-variant/30 bg-white shadow-lg lg:grid-cols-[0.9fr_1.1fr]'>
          <aside className='bg-primary px-7 py-10 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14'>
            <div>
              <p className='text-xs font-bold tracking-[0.18em] uppercase text-white/75'>
                {t('auth.registration.eyebrow')}
              </p>
              <h2 className='mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl'>
                {t('auth.registration.introduction')}
              </h2>
            </div>
            <ul className='mt-9 grid gap-4 text-sm leading-6 text-white/90 lg:mt-16'>
              <li className='flex gap-3'>
                <span aria-hidden='true'>✓</span>
                {t('auth.registration.benefitOne')}
              </li>
              <li className='flex gap-3'>
                <span aria-hidden='true'>✓</span>
                {t('auth.registration.benefitTwo')}
              </li>
              <li className='flex gap-3'>
                <span aria-hidden='true'>✓</span>
                {t('auth.registration.benefitThree')}
              </li>
            </ul>
          </aside>

          <section className='px-6 py-9 sm:px-10 sm:py-12 lg:px-14' aria-labelledby='registration-title'>
            {completed ? (
              <div className='flex min-h-96 flex-col justify-center'>
                <div
                  aria-hidden='true'
                  className='mb-6 grid size-14 place-items-center rounded-full bg-primary/10 text-2xl text-primary'
                >
                  ✓
                </div>
                <h1 id='registration-title' className='text-3xl font-bold tracking-tight'>
                  {t('auth.registration.completeTitle')}
                </h1>
                <p className='mt-3 max-w-md text-on-surface-variant'>{t('auth.registration.completeDescription')}</p>
                <Link
                  className='mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-white hover:opacity-90'
                  to='/login'
                >
                  {t('auth.registration.goToLogin')}
                </Link>
              </div>
            ) : verifying ? (
              <>
                <h1 id='registration-title' className='text-3xl font-bold tracking-tight'>
                  {t('auth.registration.verifyTitle')}
                </h1>
                <p className='mt-2 max-w-md text-sm leading-6 text-on-surface-variant'>
                  {t('auth.registration.verifyDescription')}
                </p>
                <form className='mt-8 space-y-5' noValidate onSubmit={handleVerify}>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='register-email-verify'>
                      {t('auth.email')}
                    </label>
                    <input
                      autoComplete='email'
                      className={inputClass}
                      id='register-email-verify'
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type='email'
                      value={email}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='register-otp'>
                      {t('auth.registration.otpCode')}
                    </label>
                    <input
                      autoComplete='one-time-code'
                      className={inputClass}
                      id='register-otp'
                      inputMode='numeric'
                      maxLength={6}
                      onChange={(event) => setOtpCode(event.target.value.replace(/[^0-9]/g, ''))}
                      required
                      value={otpCode}
                    />
                  </div>
                  {validationError && (
                    <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
                      {t(validationError)}
                    </p>
                  )}
                  {verify.isError && (
                    <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
                      {t(registrationErrorKey(verify.error, 'verify'))}
                    </p>
                  )}
                  <button
                    className='h-12 w-full rounded-xl bg-primary font-semibold text-white hover:opacity-90 disabled:opacity-60'
                    disabled={verify.isPending}
                    type='submit'
                  >
                    {verify.isPending ? t('auth.registration.verifying') : t('auth.registration.verify')}
                  </button>
                </form>
                <div className='mt-6 space-y-3 text-sm'>
                  {resent && (
                    <p className='text-primary' role='status'>
                      {t('auth.registration.resent')}
                    </p>
                  )}
                  {resend.isError && (
                    <p className='rounded-xl bg-error/10 p-3 text-error' role='alert'>
                      {t(registrationErrorKey(resend.error, 'resend'))}
                    </p>
                  )}
                  <button
                    className='font-semibold text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60'
                    disabled={resendSeconds > 0 || resend.isPending}
                    onClick={handleResend}
                    type='button'
                  >
                    {resend.isPending
                      ? t('auth.registration.resending')
                      : resendSeconds > 0
                        ? t('auth.registration.resendCountdown', { seconds: resendSeconds })
                        : t('auth.registration.resend')}
                  </button>
                </div>
                <button
                  className='mt-8 block text-sm font-semibold text-on-surface-variant hover:underline'
                  onClick={() => {
                    setValidationError(null)
                    setSearchParams({})
                  }}
                  type='button'
                >
                  {t('auth.registration.backToRegister')}
                </button>
              </>
            ) : (
              <>
                <h1 id='registration-title' className='text-3xl font-bold tracking-tight'>
                  {t('auth.registration.title')}
                </h1>
                <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t('auth.registration.description')}</p>
                <form className='mt-7 space-y-4' noValidate onSubmit={handleRegister}>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='register-name'>
                      {t('auth.registration.fullName')}
                    </label>
                    <input
                      autoComplete='name'
                      className={inputClass}
                      id='register-name'
                      maxLength={255}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      value={fullName}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='register-email'>
                      {t('auth.email')}
                    </label>
                    <input
                      autoComplete='email'
                      className={inputClass}
                      id='register-email'
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type='email'
                      value={email}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='register-phone'>
                      {t('auth.registration.phoneNumber')}
                    </label>
                    <input
                      autoComplete='tel'
                      className={inputClass}
                      id='register-phone'
                      inputMode='tel'
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      type='tel'
                      value={phoneNumber}
                    />
                  </div>
                  <div>
                    <PasswordField
                      autoComplete='new-password'
                      id='register-password'
                      label={t('auth.registration.password')}
                      onChange={setPassword}
                      value={password}
                    />
                    <p className='mt-2 text-xs leading-5 text-on-surface-variant'>
                      {t('auth.registration.passwordHint')}
                    </p>
                  </div>
                  <PasswordField
                    autoComplete='new-password'
                    id='register-confirm'
                    label={t('auth.registration.confirmPassword')}
                    onChange={setConfirmPassword}
                    value={confirmPassword}
                  />
                  {validationError && (
                    <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
                      {t(validationError)}
                    </p>
                  )}
                  {register.isError && (
                    <p className='rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
                      {t(registrationErrorKey(register.error, 'register'))}
                    </p>
                  )}
                  <button
                    className='mt-2 h-12 w-full rounded-xl bg-primary font-semibold text-white hover:opacity-90 disabled:opacity-60'
                    disabled={register.isPending}
                    type='submit'
                  >
                    {register.isPending ? t('auth.registration.submitting') : t('auth.registration.submit')}
                  </button>
                </form>
                <div className='mt-6 space-y-3 text-center text-sm text-on-surface-variant'>
                  <p>
                    {t('auth.registration.haveAccount')}{' '}
                    <Link className='font-semibold text-primary hover:underline' to='/login'>
                      {t('auth.registration.signIn')}
                    </Link>
                  </p>
                  <p>
                    {t('auth.registration.haveCode')}{' '}
                    <button
                      className='font-semibold text-primary hover:underline'
                      onClick={() => {
                        setValidationError(null)
                        setSearchParams({ step: 'verify' })
                      }}
                      type='button'
                    >
                      {t('auth.registration.verifyLink')}
                    </button>
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
