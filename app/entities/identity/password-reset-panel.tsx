import { useMutation } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'

import { confirmPasswordReset, sendPasswordResetCode } from './password-reset-api'
import { validPassword } from './password-rules'

const key = 'auth.recovery.assist' as const
/** IdentityService silently ignores a new code within 60 seconds of the previous one. */
const RESEND_SECONDS = 60

type Field = 'otpCode' | 'newPassword' | 'confirmation'
type FieldError = 'codeFormat' | 'codeInvalid' | 'passwordRules' | 'passwordMismatch'

/** IdentityService OTP and password codes that belong to one input. */
const ERROR_MAP = {
  fields: {
    1059: { field: 'otpCode', key: 'codeFormat' },
    1060: { field: 'otpCode', key: 'codeInvalid' },
    1061: { field: 'otpCode', key: 'codeInvalid' },
    1062: { field: 'otpCode', key: 'codeInvalid' },
    1063: { field: 'otpCode', key: 'codeInvalid' },
    1072: { field: 'otpCode', key: 'codeInvalid' },
    1074: { field: 'newPassword', key: 'passwordRules' }
  }
} as const satisfies { fields: Record<number, { field: Field; key: FieldError }> }

export interface PasswordResetPanelProps {
  email: string
  name: string
  /** `new`: an account provisioned without a password; `existing`: change the password of any account. */
  mode: 'new' | 'existing'
  /** Sends the first code as soon as the panel opens (right after an account is created). */
  sendOnOpen?: boolean
  className?: string
}

/**
 * Password setup by email OTP for an account the administrator manages. The code only reaches the owner's inbox, so
 * the administrator either lets the owner finish on the reset page or types the code the owner reads out. Uses the
 * public `/auth/forgot-password` and `/auth/reset-password` endpoints; no password is kept after submit.
 */
export function PasswordResetPanel({ email, name, mode, sendOnOpen = false, className = '' }: PasswordResetPanelProps) {
  const { t } = useTranslation()
  const id = useId()
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [visible, setVisible] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sentOnce, setSentOnce] = useState(false)
  const [done, setDone] = useState(false)
  const sendErrors = useFormErrors<Field, FieldError>()
  const resetFormRef = useRef<HTMLFormElement>(null)
  const resetErrors = useFormErrors<Field, FieldError>(ERROR_MAP, resetFormRef)

  // Tracked from the callbacks: the observer's `isPending` can stay true when the first send starts from an effect
  // that React re-runs in development.
  const [sending, setSending] = useState(false)
  const send = useMutation({
    mutationFn: () => sendPasswordResetCode({ email }),
    onMutate: () => {
      sendErrors.reset()
      setSending(true)
    },
    onSettled: () => setSending(false),
    onSuccess: () => {
      setSentOnce(true)
      setDone(false)
      setCooldown(RESEND_SECONDS)
    },
    onError: sendErrors.fromApi
  })
  const reset = useMutation({
    mutationFn: () => confirmPasswordReset({ email, otpCode, newPassword }),
    onSuccess: () => {
      setDone(true)
      setOtpCode('')
      setNewPassword('')
      setConfirmation('')
    },
    onError: resetErrors.fromApi
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const { mutate: sendCode } = send
  // Once per panel: React re-runs effects in development, and a second request would only restart the cooldown.
  const sentOnOpen = useRef(false)
  useEffect(() => {
    if (!sendOnOpen || sentOnOpen.current) return
    sentOnOpen.current = true
    sendCode()
  }, [sendOnOpen, sendCode])

  function submit(event: FormEvent) {
    event.preventDefault()
    const errors: Partial<Record<Field, FieldError>> = {}
    if (!/^[0-9]{6}$/.test(otpCode.trim())) errors.otpCode = 'codeFormat'
    if (!validPassword(newPassword)) errors.newPassword = 'passwordRules'
    else if (newPassword !== confirmation) errors.confirmation = 'passwordMismatch'
    if (resetErrors.validate(errors)) reset.mutate()
  }

  function fieldProps(field: Field) {
    const error = resetErrors.fieldErrors[field]
    return {
      id: `${id}-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `${id}-${field}-error` : field === 'newPassword' ? `${id}-rules` : undefined
    }
  }

  function fieldError(field: Field) {
    const error = resetErrors.fieldErrors[field]
    return error ? (
      <p className='mt-1 text-xs font-medium text-error' id={`${id}-${field}-error`}>
        {t(`${key}.errors.${error}`)}
      </p>
    ) : null
  }

  const resetLink = `/forgot-password?email=${encodeURIComponent(email)}`

  return (
    <section aria-labelledby={`${id}-title`} className={`space-y-4 ${className}`}>
      <div className='flex items-start gap-3'>
        <Icon className='mt-0.5 text-xl text-primary' name='key' />
        <div>
          <h3 className='font-bold text-on-surface' id={`${id}-title`}>
            {t(mode === 'new' ? `${key}.titleNew` : `${key}.titleExisting`)}
          </h3>
          <p className='mt-1 text-sm text-on-surface-variant'>
            {t(mode === 'new' ? `${key}.descriptionNew` : `${key}.descriptionExisting`)}
          </p>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Button
          disabled={cooldown > 0}
          leftIcon={<Icon className='text-lg' name='forward_to_inbox' />}
          loading={sending}
          onClick={() => send.mutate()}
          size='sm'
          variant={sentOnce ? 'outline' : 'primary'}
        >
          {cooldown > 0
            ? t(`${key}.resendIn`, { seconds: cooldown })
            : sentOnce
              ? t(`${key}.resend`)
              : t(`${key}.send`, { email })}
        </Button>
        {sentOnce && !sending ? (
          <p className='text-sm text-on-surface-variant' role='status'>
            {t(`${key}.sent`, { email })}
          </p>
        ) : null}
      </div>
      {sendErrors.failure ? (
        <FormAlert
          actionLabel={t('common.ui.retry')}
          onAction={() => send.mutate()}
          tone={sendErrors.failure.kind === 'system' ? 'error' : 'warning'}
        >
          {t(sendErrors.failure.key)}
        </FormAlert>
      ) : null}

      {done ? (
        <p
          className='flex items-start gap-2 rounded-xl bg-success-container px-4 py-3 text-sm text-on-success-container'
          role='status'
        >
          <Icon className='text-lg' name='check_circle' />
          {t(`${key}.success`, { name, email })}
        </p>
      ) : null}

      {sentOnce && !done ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-xl bg-surface-container-low p-4 text-sm'>
            <p className='font-semibold text-on-surface'>{t(`${key}.selfServeTitle`)}</p>
            <p className='mt-1 text-on-surface-variant'>{t(`${key}.selfServe`)}</p>
            <a
              className='mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline'
              href={resetLink}
              rel='noreferrer'
              target='_blank'
            >
              {t(`${key}.selfServeLink`)}
              <Icon className='text-base' name='open_in_new' />
            </a>
          </div>
          <form
            className='space-y-3 rounded-xl border border-outline-variant/60 p-4 text-sm'
            noValidate
            onSubmit={submit}
            ref={resetFormRef}
          >
            <div>
              <p className='font-semibold text-on-surface'>{t(`${key}.assistedTitle`)}</p>
              <p className='mt-1 text-on-surface-variant'>{t(`${key}.assisted`)}</p>
            </div>
            <div>
              <label className='text-xs font-semibold text-on-surface-variant' htmlFor={`${id}-otpCode`}>
                {t(`${key}.code`)}
              </label>
              <input
                {...fieldProps('otpCode')}
                autoComplete='one-time-code'
                className={`${baseControlClass} mt-1 tracking-[0.3em] tabular-nums`}
                inputMode='numeric'
                maxLength={6}
                onChange={(event) => {
                  setOtpCode(event.target.value.replace(/\D/g, ''))
                  resetErrors.clearField('otpCode')
                }}
                value={otpCode}
              />
              {fieldError('otpCode')}
            </div>
            {(['newPassword', 'confirmation'] as const).map((field) => (
              <div key={field}>
                <label className='text-xs font-semibold text-on-surface-variant' htmlFor={`${id}-${field}`}>
                  {t(field === 'newPassword' ? `${key}.newPassword` : `${key}.confirmPassword`)}
                </label>
                <input
                  {...fieldProps(field)}
                  autoComplete='new-password'
                  className={`${baseControlClass} mt-1`}
                  onChange={(event) => {
                    if (field === 'newPassword') setNewPassword(event.target.value)
                    else setConfirmation(event.target.value)
                    resetErrors.clearField(field)
                  }}
                  type={visible ? 'text' : 'password'}
                  value={field === 'newPassword' ? newPassword : confirmation}
                />
                {field === 'newPassword' && !resetErrors.fieldErrors.newPassword ? (
                  <p className='mt-1 text-xs text-on-surface-variant' id={`${id}-rules`}>
                    {t(`${key}.rules`)}
                  </p>
                ) : null}
                {fieldError(field)}
              </div>
            ))}
            <label className='flex items-center gap-2 text-xs text-on-surface-variant'>
              <input checked={visible} onChange={(event) => setVisible(event.target.checked)} type='checkbox' />
              {t(`${key}.showPassword`)}
            </label>
            <p className='text-xs text-on-surface-variant'>{t(`${key}.signOutNote`)}</p>
            {resetErrors.failure ? (
              <FormAlert tone={resetErrors.failure.kind === 'system' ? 'error' : 'warning'}>
                {t(resetErrors.failure.key)}
              </FormAlert>
            ) : null}
            <Button loading={reset.isPending} loadingLabel={t(`${key}.submitting`)} size='sm' type='submit'>
              {t(`${key}.submit`)}
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  )
}
