import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { validPassword } from '~/entities/identity/password-rules'
import { PasswordField } from '~/features/shared/auth/password-field'
import { changePassword } from '~/features/shared/auth/security-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.profile.security' as const

/** The rules of `validPassword`, checked one by one so the customer sees which are met while typing. */
const RULES = [
  { id: 'length', test: (value: string) => value.length >= 8 && new TextEncoder().encode(value).length <= 72 },
  { id: 'lower', test: (value: string) => /[a-z]/.test(value) },
  { id: 'upper', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'digit', test: (value: string) => /[0-9]/.test(value) },
  { id: 'symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) }
] as const

const LEVELS = [
  { id: 'weak', bar: 'bg-error', text: 'text-error' },
  { id: 'fair', bar: 'bg-caution', text: 'text-caution' },
  { id: 'good', bar: 'bg-info', text: 'text-info' },
  { id: 'strong', bar: 'bg-primary', text: 'text-primary' }
] as const

/** 0–3: weak, fair, good, strong. Every rule met is "good"; 12+ characters on top of that is "strong". */
export function passwordStrength(value: string) {
  const met = RULES.filter((rule) => rule.test(value)).length
  if (met === RULES.length) return value.length >= 12 ? 3 : 2
  return met >= 3 ? 1 : 0
}

/** Password change with show / hide, a strength bar and a live checklist; success reloads the sign-in page. */
export function PasswordChangePanel() {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => window.location.replace('/login'),
    onError: (error) => setMessage(t(apiRequestErrorKey(error, 'auth.security.actionError')))
  })
  const level = LEVELS[passwordStrength(newPassword)]
  const mismatch = confirmPassword !== '' && confirmPassword !== newPassword

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (!validPassword(newPassword)) return setMessage(t('auth.security.invalidPassword'))
    if (newPassword !== confirmPassword) return setMessage(t('auth.security.passwordMismatch'))
    change.mutate()
  }

  return (
    <section
      aria-labelledby='account-security-title'
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'
    >
      <h2 className='text-lg font-bold tracking-tight text-forest-950' id='account-security-title'>
        {t('auth.security.passwordSectionTitle')}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>

      {message ? (
        <p
          className='mt-5 rounded-xl border border-error/25 bg-error-container p-3.5 text-sm font-medium text-on-error-container'
          role='alert'
        >
          {message}
        </p>
      ) : null}

      <form className='mt-6 flex max-w-lg flex-col gap-5' noValidate onSubmit={submit}>
        <PasswordField
          autoComplete='current-password'
          id='profile-current-password'
          label={t('auth.security.currentPassword')}
          onChange={setCurrentPassword}
          value={currentPassword}
        />
        <div>
          <PasswordField
            autoComplete='new-password'
            id='profile-new-password'
            label={t('auth.security.newPassword')}
            onChange={setNewPassword}
            value={newPassword}
          />
          {newPassword ? (
            <div aria-live='polite' className='mt-2.5'>
              <div aria-hidden='true' className='grid grid-cols-4 gap-1.5'>
                {LEVELS.map((item, index) => (
                  <span
                    className={`h-1.5 rounded-full transition-colors duration-200 ${index <= LEVELS.indexOf(level) ? level.bar : 'bg-surface-container'}`}
                    key={item.id}
                  />
                ))}
              </div>
              <p className={`mt-1.5 text-xs font-semibold ${level.text}`}>
                {t(`${key}.strength`, { level: t(`${key}.levels.${level.id}`) })}
              </p>
            </div>
          ) : null}
          <ul aria-label={t(`${key}.rulesLabel`)} className='mt-3 grid gap-1.5 text-sm sm:grid-cols-2'>
            {RULES.map((rule) => {
              const met = rule.test(newPassword)
              return (
                <li
                  className={`flex items-center gap-2 transition-colors ${met ? 'text-primary' : 'text-on-surface-variant'}`}
                  key={rule.id}
                >
                  <Icon className='text-lg' filled={met} name={met ? 'check_circle' : 'radio_button_unchecked'} />
                  {t(`${key}.rules.${rule.id}`)}
                  <span className='sr-only'>{met ? t(`${key}.met`) : t(`${key}.notMet`)}</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <PasswordField
            autoComplete='new-password'
            id='profile-confirm-password'
            label={t('auth.security.confirmPassword')}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
          {mismatch ? <p className='mt-1.5 text-sm text-error'>{t('auth.security.passwordMismatch')}</p> : null}
        </div>
        <div className='flex justify-end border-t border-outline-variant pt-5'>
          <Button loading={change.isPending} type='submit'>
            {change.isPending ? t('auth.security.processing') : t('auth.security.changePassword')}
          </Button>
        </div>
      </form>
    </section>
  )
}
