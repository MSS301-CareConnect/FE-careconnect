import { useMutation } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import {
  confirmPasswordReset,
  passwordRecoveryErrorKey,
  sendPasswordResetCode
} from '~/entities/identity/password-reset-api'
import { validPassword } from '~/entities/identity/password-rules'

import { AuthMessage, AuthSteps, AuthTextField } from './auth-form-parts'
import { AuthSwap } from './auth-shell'
import { authDescription, authLink, authSubmit, authTitle } from './auth-styles'
import { PasswordField } from './password-field'

type RecoveryValidationKey =
  | 'auth.recovery.invalidEmail'
  | 'auth.recovery.invalidOtp'
  | 'auth.recovery.passwordRules'
  | 'auth.recovery.passwordMismatch'

export function PasswordRecoveryPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.recovery.documentTitle'))
  const [params] = useSearchParams()
  // An administrator who created the account can send its owner here with the email filled in.
  const [email, setEmail] = useState(() => params.get('email') ?? '')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [codeRequested, setCodeRequested] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [validationError, setValidationError] = useState<RecoveryValidationKey | null>(null)
  const request = useMutation({
    mutationFn: sendPasswordResetCode,
    onSuccess: () => {
      setCodeRequested(true)
      setValidationError(null)
    }
  })
  const reset = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      setCompleted(true)
      setNewPassword('')
      setConfirmation('')
      setOtpCode('')
      setValidationError(null)
    }
  })

  function sendCode() {
    const address = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setValidationError('auth.recovery.invalidEmail')
      return
    }
    setValidationError(null)
    reset.reset()
    request.mutate({ email: address })
  }

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendCode()
  }

  function changeEmail() {
    setCodeRequested(false)
    setValidationError(null)
    setOtpCode('')
    request.reset()
    reset.reset()
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let error: RecoveryValidationKey | null = null
    if (!/^[0-9]{6}$/.test(otpCode)) error = 'auth.recovery.invalidOtp'
    else if (!validPassword(newPassword)) error = 'auth.recovery.passwordRules'
    else if (newPassword !== confirmation) error = 'auth.recovery.passwordMismatch'
    setValidationError(error)
    if (error) return
    reset.mutate({ email: email.trim(), otpCode, newPassword })
  }

  const serverError = reset.error ?? request.error
  const step = completed ? 2 : codeRequested ? 1 : 0
  const errorMessage =
    validationError || serverError ? (
      <AuthMessage tone='error'>{t(validationError ?? passwordRecoveryErrorKey(serverError))}</AuthMessage>
    ) : null

  return (
    <>
      <AuthSteps
        current={step}
        steps={[t('auth.shell.steps.email'), t('auth.shell.steps.newPassword'), t('auth.shell.steps.done')]}
      />
      <h1 className={authTitle}>{t('auth.recovery.title')}</h1>
      <p className={authDescription}>{t('auth.recovery.description')}</p>

      <AuthSwap className='mt-6' key={step}>
        {step === 2 ? (
          <div className='py-4 text-center'>
            <motion.span
              animate={{ scale: 1, opacity: 1 }}
              aria-hidden='true'
              className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-100 text-mint-500 ring-8 ring-mint-50'
              initial={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.15 }}
            >
              <Icon className='text-3xl' filled name='lock_reset' />
            </motion.span>
            <p className='mt-5 text-[15px] font-medium text-forest-900' role='status'>
              {t('auth.recovery.success')}
            </p>
            <Link className={`${authSubmit} mt-7`} to='/login'>
              {t('auth.signIn')}
              <Icon className='text-lg' name='arrow_forward' />
            </Link>
          </div>
        ) : step === 1 ? (
          <>
            <AuthMessage tone='notice'>{t('auth.recovery.codeSent')}</AuthMessage>
            <div className='mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-forest-900/[0.04] px-4 py-2.5 text-xs sm:text-sm text-forest-800'>
              <span className='min-w-0 break-all'>
                <Trans
                  components={{ strong: <strong className='font-semibold text-forest-950' /> }}
                  i18nKey='auth.shell.codeSentTo'
                  values={{ email: email.trim() }}
                />
              </span>
              <button className={`${authLink} font-semibold`} onClick={changeEmail} type='button'>
                {t('auth.shell.changeEmail')}
              </button>
            </div>
            <form className='mt-5 space-y-4' noValidate onSubmit={handleReset}>
              <AuthTextField
                autoComplete='one-time-code'
                icon='pin'
                id='recovery-code'
                placeholder={t('auth.shell.placeholders.otp')}
                inputClassName='text-lg font-bold tracking-[0.45em] tabular-nums'
                inputMode='numeric'
                label={t('auth.recovery.code')}
                maxLength={6}
                onChange={(event) => setOtpCode(event.target.value.replace(/[^0-9]/g, ''))}
                required
                value={otpCode}
              />
              <div className='grid gap-3 sm:grid-cols-2'>
                <PasswordField
                  autoComplete='new-password'
                  id='recovery-password'
                  placeholder={t('auth.shell.placeholders.newPassword')}
                  label={t('auth.recovery.newPassword')}
                  onChange={setNewPassword}
                  value={newPassword}
                  variant='auth'
                />
                <PasswordField
                  autoComplete='new-password'
                  id='recovery-confirm'
                  placeholder={t('auth.shell.placeholders.confirmPassword')}
                  label={t('auth.recovery.confirmPassword')}
                  onChange={setConfirmation}
                  value={confirmation}
                  variant='auth'
                />
              </div>
              {errorMessage}
              <button className={`${authSubmit} mt-2`} disabled={reset.isPending} type='submit'>
                {reset.isPending ? t('auth.recovery.resetting') : t('auth.recovery.reset')}
              </button>
            </form>
            <div className='mt-5 flex items-center justify-between gap-3 text-sm'>
              <Link
                className='inline-flex items-center gap-1 font-semibold text-forest-800/70 hover:text-forest-950'
                to='/login'
              >
                <Icon className='text-base' name='arrow_back' />
                {t('auth.shell.backToSignIn')}
              </Link>
              <button className={authLink} disabled={request.isPending} onClick={sendCode} type='button'>
                {request.isPending ? t('auth.recovery.sending') : t('auth.recovery.resend')}
              </button>
            </div>
          </>
        ) : (
          <form className='space-y-4' noValidate onSubmit={handleRequest}>
            <AuthTextField
              autoComplete='email'
              icon='mail'
              id='recovery-email'
              placeholder={t('auth.shell.placeholders.email')}
              label={t('auth.recovery.email')}
              onChange={(event) => {
                setEmail(event.target.value)
                setValidationError(null)
                request.reset()
              }}
              required
              type='email'
              value={email}
            />
            {errorMessage}
            <button className={`${authSubmit} mt-2`} disabled={request.isPending} type='submit'>
              {request.isPending ? t('auth.recovery.sending') : t('auth.recovery.sendCode')}
              {request.isPending ? null : <Icon className='text-lg' name='arrow_forward' />}
            </button>
            <p className='mt-5 text-center text-sm text-forest-800/70'>
              {t('auth.shell.rememberPassword')}{' '}
              <Link className='font-bold text-forest-950 hover:underline underline-offset-4' to='/login'>
                {t('auth.shell.signInTab')}
              </Link>
            </p>
          </form>
        )}
      </AuthSwap>
    </>
  )
}
