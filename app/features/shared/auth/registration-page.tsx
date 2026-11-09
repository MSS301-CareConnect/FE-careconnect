import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { AuthMessage, AuthSteps, AuthTextField } from './auth-form-parts'
import { AuthSwap } from './auth-shell'
import { authDescription, authLink, authSubmit, authTitle } from './auth-styles'
import { PasswordField } from './password-field'
import { registrationErrorKey } from './registration-api'
import { useRegistrationFlow } from './use-registration-flow'

export function RegistrationPage() {
  const { t } = useTranslation()
  const flow = useRegistrationFlow()
  const { fields, set } = flow
  const step = flow.completed ? 'done' : flow.verifying ? 'verify' : 'details'
  const steps = [t('auth.shell.steps.details'), t('auth.shell.steps.verify')]

  return (
    <>
      <AuthSwap key={step}>
        {step === 'done' ? (
          <section aria-labelledby='registration-title' className='py-4 text-center'>
            <motion.span
              animate={{ scale: 1, opacity: 1 }}
              aria-hidden='true'
              className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-100 text-mint-500 ring-8 ring-mint-50'
              initial={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.15 }}
            >
              <Icon className='text-3xl' filled name='check_circle' />
            </motion.span>
            <h1 className={`${authTitle} mt-5`} id='registration-title'>
              {t('auth.registration.completeTitle')}
            </h1>
            <p className={`${authDescription} mx-auto max-w-sm`}>{t('auth.registration.completeDescription')}</p>
            <Link className={`${authSubmit} mt-7`} to='/login'>
              {t('auth.registration.goToLogin')}
              <Icon className='text-lg' name='arrow_forward' />
            </Link>
          </section>
        ) : step === 'verify' ? (
          <section aria-labelledby='registration-title'>
            <AuthSteps current={1} steps={steps} />
            <h1 className={authTitle} id='registration-title'>
              {t('auth.registration.verifyTitle')}
            </h1>
            <p className={authDescription}>{t('auth.registration.verifyDescription')}</p>
            <form className='mt-6 space-y-4' noValidate onSubmit={flow.handleVerify}>
              <AuthTextField
                autoComplete='email'
                icon='mail'
                id='register-email-verify'
                placeholder={t('auth.shell.placeholders.email')}
                label={t('auth.email')}
                onChange={(event) => set.setEmail(event.target.value)}
                required
                type='email'
                value={fields.email}
              />
              <AuthTextField
                autoComplete='one-time-code'
                icon='pin'
                id='register-otp'
                placeholder={t('auth.shell.placeholders.otp')}
                inputClassName='text-lg font-bold tracking-[0.45em] tabular-nums'
                inputMode='numeric'
                label={t('auth.registration.otpCode')}
                maxLength={6}
                onChange={(event) => set.setOtpCode(event.target.value.replace(/[^0-9]/g, ''))}
                required
                value={fields.otpCode}
              />
              {flow.validationError ? <AuthMessage tone='error'>{t(flow.validationError)}</AuthMessage> : null}
              {flow.verify.isError ? (
                <AuthMessage tone='error'>{t(registrationErrorKey(flow.verify.error, 'verify'))}</AuthMessage>
              ) : null}
              <button className={`${authSubmit} mt-2`} disabled={flow.verify.isPending} type='submit'>
                {flow.verify.isPending ? t('auth.registration.verifying') : t('auth.registration.verify')}
              </button>
            </form>
            <div className='mt-5 space-y-3 text-sm'>
              {flow.resent ? <AuthMessage tone='notice'>{t('auth.registration.resent')}</AuthMessage> : null}
              {flow.resend.isError ? (
                <AuthMessage tone='error'>{t(registrationErrorKey(flow.resend.error, 'resend'))}</AuthMessage>
              ) : null}
              <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
                <button
                  className='inline-flex items-center gap-1 font-semibold text-forest-800/70 transition-colors hover:text-forest-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                  onClick={() => flow.goToStep('details')}
                  type='button'
                >
                  <Icon className='text-base' name='arrow_back' />
                  {t('auth.registration.backToRegister')}
                </button>
                <button
                  className={`${authLink} tabular-nums`}
                  disabled={flow.resendSeconds > 0 || flow.resend.isPending}
                  onClick={flow.handleResend}
                  type='button'
                >
                  {flow.resend.isPending
                    ? t('auth.registration.resending')
                    : flow.resendSeconds > 0
                      ? t('auth.registration.resendCountdown', { seconds: flow.resendSeconds })
                      : t('auth.registration.resend')}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section aria-labelledby='registration-title'>
            <AuthSteps current={0} steps={steps} />
            <h1 className={authTitle} id='registration-title'>
              {t('auth.registration.title')}
            </h1>
            <p className={authDescription}>{t('auth.registration.description')}</p>
            <form className='mt-5 space-y-3.5' noValidate onSubmit={flow.handleRegister}>
              <div className='grid gap-3 sm:grid-cols-2'>
                <AuthTextField
                  autoComplete='name'
                  icon='person'
                  id='register-name'
                  placeholder={t('auth.shell.placeholders.fullName')}
                  label={t('auth.registration.fullName')}
                  maxLength={255}
                  onChange={(event) => set.setFullName(event.target.value)}
                  required
                  value={fields.fullName}
                />
                <AuthTextField
                  autoComplete='tel'
                  icon='call'
                  id='register-phone'
                  placeholder={t('auth.shell.placeholders.phone')}
                  inputMode='tel'
                  label={t('auth.registration.phoneNumber')}
                  onChange={(event) => set.setPhoneNumber(event.target.value)}
                  type='tel'
                  value={fields.phoneNumber}
                />
              </div>
              <AuthTextField
                autoComplete='email'
                icon='mail'
                id='register-email'
                placeholder={t('auth.shell.placeholders.email')}
                label={t('auth.email')}
                onChange={(event) => set.setEmail(event.target.value)}
                required
                type='email'
                value={fields.email}
              />
              <div className='grid gap-3 sm:grid-cols-2'>
                <PasswordField
                  autoComplete='new-password'
                  id='register-password'
                  placeholder={t('auth.shell.placeholders.newPassword')}
                  label={t('auth.registration.password')}
                  onChange={set.setPassword}
                  value={fields.password}
                  variant='auth'
                />
                <PasswordField
                  autoComplete='new-password'
                  id='register-confirm'
                  placeholder={t('auth.shell.placeholders.confirmPassword')}
                  label={t('auth.registration.confirmPassword')}
                  onChange={set.setConfirmPassword}
                  value={fields.confirmPassword}
                  variant='auth'
                />
              </div>
              <p className='text-xs leading-5 text-forest-800/60'>{t('auth.registration.passwordHint')}</p>
              {flow.validationError ? <AuthMessage tone='error'>{t(flow.validationError)}</AuthMessage> : null}
              {flow.register.isError ? (
                <AuthMessage tone='error'>{t(registrationErrorKey(flow.register.error, 'register'))}</AuthMessage>
              ) : null}
              <button className={`${authSubmit} mt-2`} disabled={flow.register.isPending} type='submit'>
                {flow.register.isPending ? t('auth.registration.submitting') : t('auth.registration.submit')}
              </button>
            </form>
            <p className='mt-5 text-center text-sm text-forest-800/70'>
              {t('auth.registration.haveAccount')}{' '}
              <Link className='font-bold text-forest-950 hover:underline underline-offset-4' to='/login'>
                {t('auth.shell.signInTab')}
              </Link>
            </p>
            <p className='mt-2 text-center text-xs text-forest-800/60'>
              {t('auth.registration.haveCode')}{' '}
              <button className={`${authLink} font-semibold`} onClick={() => flow.goToStep('verify')} type='button'>
                {t('auth.registration.verifyLink')}
              </button>
            </p>
          </section>
        )}
      </AuthSwap>
    </>
  )
}
