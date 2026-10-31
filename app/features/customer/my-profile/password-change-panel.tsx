import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { changePassword } from '~/features/shared/auth/security-api'
import { PasswordField } from '~/features/shared/auth/password-field'
import { validPassword } from '~/entities/identity/password-rules'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (!validPassword(newPassword)) {
      setMessage(t('auth.security.invalidPassword'))
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage(t('auth.security.passwordMismatch'))
      return
    }
    change.mutate()
  }

  return (
    <section className='rounded-2xl bg-white p-6 shadow-sm sm:p-8' id='account-security'>
      <div className='flex items-center gap-3 border-b border-outline-variant/25 pb-5'>
        <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-primary'>
          <Icon name='lock_reset' />
        </span>
        <div>
          <h2 className='text-xl font-bold'>{t('auth.security.passwordSectionTitle')}</h2>
          <p className='mt-1 text-xs text-on-surface-variant'>{t('auth.security.passwordHint')}</p>
        </div>
      </div>

      {message ? (
        <p
          className='mt-6 rounded-xl border border-error/25 bg-error-container p-3.5 text-sm font-medium text-on-error-container'
          role='alert'
        >
          {message}
        </p>
      ) : null}

      <form className='mt-7 space-y-5' onSubmit={submit}>
        <PasswordField
          autoComplete='current-password'
          id='profile-current-password'
          label={t('auth.security.currentPassword')}
          onChange={setCurrentPassword}
          value={currentPassword}
        />
        <PasswordField
          autoComplete='new-password'
          id='profile-new-password'
          label={t('auth.security.newPassword')}
          onChange={setNewPassword}
          value={newPassword}
        />
        <PasswordField
          autoComplete='new-password'
          id='profile-confirm-password'
          label={t('auth.security.confirmPassword')}
          onChange={setConfirmPassword}
          value={confirmPassword}
        />
        <div className='flex justify-end border-t border-outline-variant/25 pt-5'>
          <button
            aria-busy={change.isPending}
            className='min-h-11 rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary disabled:opacity-60'
            disabled={change.isPending}
            type='submit'
          >
            {change.isPending ? t('auth.security.processing') : t('auth.security.changePassword')}
          </button>
        </div>
      </form>
    </section>
  )
}
