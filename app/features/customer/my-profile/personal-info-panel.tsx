import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { sessionQueryKey } from '~/features/shared/auth/session-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'

import { saveMyProfile } from './profile-api'

const key = 'customer.profile' as const
const PHONE = /^[0-9]{10,11}$/

type FieldError = 'invalidName' | 'invalidPhone'

/**
 * Personal information reads as key–value pairs; "Edit" turns them into a form. The save / cancel bar sticks to the
 * bottom of the screen only while something changed. Email stays read-only (the profile contract cannot change it).
 */
export function PersonalInfoPanel({ user, memberSince }: { user: UserResponse; memberSince: string | null }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '')
  const [fieldError, setFieldError] = useState<FieldError | null>(null)
  const name = user.fullName || user.email || t('customer.nav.userName')
  const dirty = fullName !== (user.fullName ?? '') || phoneNumber !== (user.phoneNumber ?? '')

  const update = useMutation({
    mutationFn: saveMyProfile,
    onSuccess: (saved) => {
      queryClient.setQueryData(sessionQueryKey, saved)
      setFullName(saved.fullName ?? '')
      setPhoneNumber(saved.phoneNumber ?? '')
      setEditing(false)
      toastSuccess(t(`${key}.saved`))
    }
  })

  function reset() {
    setFullName(user.fullName ?? '')
    setPhoneNumber(user.phoneNumber ?? '')
    setFieldError(null)
    update.reset()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = fullName.trim()
    const phone = phoneNumber.trim()
    if (!nextName || nextName.length > 255) return setFieldError('invalidName')
    if ((phone || user.phoneNumber) && !PHONE.test(phone)) return setFieldError('invalidPhone')
    setFieldError(null)
    update.mutate({ fullName: nextName, ...(phone ? { phoneNumber: phone } : {}) })
  }

  return (
    <section
      aria-labelledby='personal-info-title'
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)]'
    >
      <div className='flex flex-wrap items-center gap-4 border-b border-outline-variant/70 p-5 sm:p-6'>
        <Avatar className='h-16 w-16 shrink-0 rounded-full text-lg ring-4 ring-brand-50' decorative name={name} />
        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-lg font-semibold text-on-surface' id='personal-info-title'>
            {name}
          </h2>
          <p className='text-sm text-on-surface-variant'>
            {memberSince ? t(`${key}.memberSince`, { date: memberSince }) : t('customer.nav.customerRole')}
          </p>
        </div>
        {editing ? null : (
          <Button
            leftIcon={<Icon className='text-lg' name='edit' />}
            onClick={() => {
              reset()
              setEditing(true)
            }}
            variant='outline'
          >
            {t(`${key}.edit`)}
          </Button>
        )}
      </div>

      {editing ? (
        <form className='flex flex-col gap-5 p-5 sm:p-6' noValidate onSubmit={submit}>
          <div className='grid gap-5 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-on-surface' htmlFor='profile-name'>
                {t(`${key}.fullName`)}
              </label>
              <input
                aria-describedby={fieldError === 'invalidName' ? 'profile-name-error' : undefined}
                aria-invalid={fieldError === 'invalidName' || undefined}
                autoComplete='name'
                className={baseControlClass}
                id='profile-name'
                maxLength={255}
                onChange={(event) => setFullName(event.target.value)}
                value={fullName}
              />
              {fieldError === 'invalidName' ? (
                <p className='text-sm text-error' id='profile-name-error' role='alert'>
                  {t(`${key}.invalidName`)}
                </p>
              ) : null}
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-on-surface' htmlFor='profile-phone'>
                {t(`${key}.phone`)}
              </label>
              <input
                aria-describedby={fieldError === 'invalidPhone' ? 'profile-phone-error' : undefined}
                aria-invalid={fieldError === 'invalidPhone' || undefined}
                autoComplete='tel'
                className={baseControlClass}
                id='profile-phone'
                inputMode='tel'
                onChange={(event) => setPhoneNumber(event.target.value)}
                value={phoneNumber}
              />
              {fieldError === 'invalidPhone' ? (
                <p className='text-sm text-error' id='profile-phone-error' role='alert'>
                  {t(`${key}.invalidPhone`)}
                </p>
              ) : null}
            </div>
            <div className='flex flex-col gap-1.5 sm:col-span-2'>
              <label className='text-sm font-medium text-on-surface' htmlFor='profile-email'>
                {t(`${key}.email`)}
              </label>
              <input
                aria-describedby='profile-email-note'
                className={baseControlClass}
                id='profile-email'
                readOnly
                value={user.email ?? ''}
              />
              <p className='text-xs text-on-surface-variant' id='profile-email-note'>
                {t(`${key}.emailReadOnly`)}
              </p>
            </div>
          </div>
          {update.isError ? (
            <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
              {t(`${key}.saveFailed`)}
            </p>
          ) : null}
          <div
            className={`flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant pt-4 ${dirty ? 'cc-fade-up sticky bottom-20 z-10 -mx-5 rounded-b-2xl bg-surface-container-lowest/95 px-5 pb-1 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0' : ''}`}
          >
            {dirty ? <span className='mr-auto text-sm text-on-surface-variant'>{t(`${key}.unsaved`)}</span> : null}
            <Button
              disabled={update.isPending}
              onClick={() => {
                reset()
                setEditing(false)
              }}
              variant='outline'
            >
              {t(`${key}.cancel`)}
            </Button>
            <Button disabled={!dirty} loading={update.isPending} type='submit'>
              {t(`${key}.save`)}
            </Button>
          </div>
        </form>
      ) : (
        <dl className='grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2 sm:p-6'>
          <div>
            <dt className='text-xs text-on-surface-variant'>{t(`${key}.fullName`)}</dt>
            <dd className='mt-0.5 text-sm font-medium text-on-surface'>{user.fullName || t(`${key}.notProvided`)}</dd>
          </div>
          <div>
            <dt className='text-xs text-on-surface-variant'>{t(`${key}.phone`)}</dt>
            <dd className='mt-0.5 text-sm font-medium text-on-surface tabular-nums'>
              {user.phoneNumber || t(`${key}.notProvided`)}
            </dd>
          </div>
          <div className='sm:col-span-2'>
            <dt className='text-xs text-on-surface-variant'>{t(`${key}.email`)}</dt>
            <dd className='mt-0.5 flex items-center gap-1.5 text-sm font-medium break-all text-on-surface'>
              {user.email}
              <Icon className='text-base text-on-surface-variant' name='lock' />
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
