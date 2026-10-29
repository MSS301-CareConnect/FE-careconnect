import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { LanguageSwitch } from '~/shared/ui/language-switch'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { PasswordField } from './password-field'
import { confirmPasswordReset, passwordRecoveryErrorKey, sendPasswordResetCode } from './password-recovery-api'
import { validPassword } from './password-validation'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

export function PasswordRecoveryPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.recovery.documentTitle'))
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [codeRequested, setCodeRequested] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [validationError, setValidationError] = useState<
    | 'auth.recovery.invalidEmail'
    | 'auth.recovery.invalidOtp'
    | 'auth.recovery.passwordRules'
    | 'auth.recovery.passwordMismatch'
    | null
  >(null)
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

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const address = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setValidationError('auth.recovery.invalidEmail')
      return
    }
    setValidationError(null)
    reset.reset()
    request.mutate({ email: address })
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let error: 'auth.recovery.invalidOtp' | 'auth.recovery.passwordRules' | 'auth.recovery.passwordMismatch' | null =
      null
    if (!/^[0-9]{6}$/.test(otpCode)) error = 'auth.recovery.invalidOtp'
    else if (!validPassword(newPassword)) error = 'auth.recovery.passwordRules'
    else if (newPassword !== confirmation) error = 'auth.recovery.passwordMismatch'
    setValidationError(error)
    if (error) return
    reset.mutate({ email: email.trim(), otpCode, newPassword })
  }

  const serverError = reset.error ?? request.error

  return (
    <main className='flex min-h-screen items-center justify-center bg-surface-container-low px-4 py-10 text-on-surface'>
      <div className='w-full max-w-md rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-lg sm:p-8'>
        <div className='flex items-center justify-between gap-3'>
          <Link className='text-lg font-bold text-primary' to='/'>
            {t('common.brand')}
          </Link>
          <LanguageSwitch />
        </div>
        <h1 className='mt-8 text-3xl font-bold tracking-tight'>{t('auth.recovery.title')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('auth.recovery.description')}</p>

        {completed ? (
          <p className='mt-7 rounded-xl bg-primary/10 p-4 text-sm text-primary' role='status'>
            {t('auth.recovery.success')}
          </p>
        ) : (
          <>
            <form className='mt-7 space-y-5' onSubmit={handleRequest}>
              <div>
                <label className='block text-sm font-semibold' htmlFor='recovery-email'>
                  {t('auth.recovery.email')}
                </label>
                <input
                  autoComplete='email'
                  className={inputClass}
                  id='recovery-email'
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setCodeRequested(false)
                    setValidationError(null)
                    request.reset()
                    reset.reset()
                  }}
                  required
                  type='email'
                  value={email}
                />
              </div>
              <button
                className='h-12 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-60'
                disabled={request.isPending}
                type='submit'
              >
                {request.isPending
                  ? t('auth.recovery.sending')
                  : codeRequested
                    ? t('auth.recovery.resend')
                    : t('auth.recovery.sendCode')}
              </button>
            </form>
            {codeRequested && (
              <>
                <p className='mt-5 rounded-xl bg-primary/10 p-3 text-sm text-primary' role='status'>
                  {t('auth.recovery.codeSent')}
                </p>
                <form className='mt-5 space-y-5' onSubmit={handleReset}>
                  <div>
                    <label className='block text-sm font-semibold' htmlFor='recovery-code'>
                      {t('auth.recovery.code')}
                    </label>
                    <input
                      autoComplete='one-time-code'
                      className={inputClass}
                      id='recovery-code'
                      inputMode='numeric'
                      maxLength={6}
                      onChange={(event) => setOtpCode(event.target.value)}
                      required
                      value={otpCode}
                    />
                  </div>
                  <PasswordField
                    autoComplete='new-password'
                    id='recovery-password'
                    label={t('auth.recovery.newPassword')}
                    onChange={setNewPassword}
                    value={newPassword}
                  />
                  <PasswordField
                    autoComplete='new-password'
                    id='recovery-confirm'
                    label={t('auth.recovery.confirmPassword')}
                    onChange={setConfirmation}
                    value={confirmation}
                  />
                  <button
                    className='h-12 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-60'
                    disabled={reset.isPending}
                    type='submit'
                  >
                    {reset.isPending ? t('auth.recovery.resetting') : t('auth.recovery.reset')}
                  </button>
                </form>
              </>
            )}
            {(validationError || serverError) && (
              <p className='mt-4 rounded-xl bg-error/10 p-3 text-sm text-error' role='alert'>
                {t(validationError ?? passwordRecoveryErrorKey(serverError))}
              </p>
            )}
          </>
        )}
        <Link
          className='mt-6 block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline'
          to='/login'
        >
          {t('auth.recovery.backToLogin')}
        </Link>
      </div>
    </main>
  )
}
