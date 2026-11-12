import { useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { sessionQueryKey } from '~/features/shared/auth/session-api'
import { saveMyProfile } from '~/features/shared/profile/profile-api'
import type {
  ProviderCaregiverRecord,
  ProviderCaregiverSkillRecord,
  UserResponse
} from '~/shared/api/generated/contracts'
import { toastError, toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { formatPhone, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

/** `PUT /users/me` with the current name and the new phone, as the customer profile screen does. */
function savePhone(user: UserResponse, phoneNumber: string): Promise<UserResponse> {
  return saveMyProfile({ fullName: user.fullName, phoneNumber })
}

/** One banner for everything the center keeps, instead of a lock label on every row (2026-11-05). */
function ManagedBanner() {
  const { t } = useTranslation()
  return (
    <p className='flex items-start gap-2 rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface-variant'>
      <Icon className='mt-0.5 shrink-0 text-base' name='lock' />
      <span>
        <strong className='font-semibold text-on-surface'>{t('caregiver.me.info.managedByCenter')}</strong>
        {' · '}
        {t('caregiver.me.info.managedBanner')}
      </span>
    </p>
  )
}

function Field({ label, value, children }: { label: string; value?: ReactNode; children?: ReactNode }) {
  return (
    <div className='flex min-h-14 flex-col justify-center gap-0.5 border-b border-outline-variant py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4'>
      <dt className='text-sm text-on-surface-variant sm:w-44 sm:shrink-0'>{label}</dt>
      <dd className='flex min-w-0 flex-1 items-center justify-between gap-3 text-[15px] font-medium text-on-surface'>
        {children ?? <span className='min-w-0 break-words'>{value}</span>}
      </dd>
    </div>
  )
}

/** Personal details (phone editable, the rest kept by the center), the introduction and the assigned services. */
export function InfoTab({
  profile,
  services
}: {
  profile: ProviderCaregiverRecord
  services: UseQueryResult<ProviderCaregiverSkillRecord[]>
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const digits = phone.replace(/\D/g, '')
  const phoneValid = digits.length >= 9 && digits.length <= 15
  const save = useMutation({
    mutationFn: () => savePhone(user as UserResponse, phone.trim()),
    onSuccess: (updated) => {
      queryClient.setQueryData(sessionQueryKey, updated)
      toastSuccess(t('caregiver.me.info.phoneSaved'))
      setEditing(false)
    },
    onError: () => toastError(t('caregiver.me.info.phoneError'))
  })
  const gender =
    profile.gender === 'MALE' || profile.gender === 'FEMALE' || profile.gender === 'OTHER'
      ? t(`caregiver.ui.gender.${profile.gender}`)
      : t('caregiver.me.info.notSet')

  return (
    <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]'>
      <div className='lg:col-span-2'>
        <ManagedBanner />
      </div>
      <section aria-labelledby='info-personal' className={`${cgCard} px-4 py-2 sm:px-5`}>
        <h2 className='pt-3 pb-1 text-base font-semibold text-on-surface' id='info-personal'>
          {t('caregiver.me.info.personal')}
        </h2>
        <dl>
          <Field
            label={t('caregiver.me.info.birthDate')}
            value={profile.dateOfBirth ? format.date(profile.dateOfBirth) : t('caregiver.me.info.notSet')}
          />
          <Field label={t('caregiver.me.info.gender')} value={gender} />
          <Field
            label={t('caregiver.me.info.experience')}
            value={
              profile.experienceYears === undefined
                ? t('caregiver.me.info.notSet')
                : t('caregiver.ui.experience', { count: profile.experienceYears })
            }
          />
          <Field label={t('caregiver.me.info.email')} value={user?.email || t('caregiver.me.info.notSet')} />
          <Field label={t('caregiver.me.info.phone')}>
            {editing ? (
              <form
                className='flex w-full flex-col gap-2'
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  setTouched(true)
                  if (phoneValid) save.mutate()
                }}
              >
                <label className='sr-only' htmlFor='caregiver-phone'>
                  {t('caregiver.me.info.phoneLabel')}
                </label>
                <input
                  aria-describedby={touched && !phoneValid ? 'caregiver-phone-error' : undefined}
                  aria-invalid={touched && !phoneValid}
                  autoComplete='tel'
                  className='min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-[15px] tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 aria-invalid:border-error'
                  id='caregiver-phone'
                  inputMode='tel'
                  onBlur={() => setTouched(true)}
                  onChange={(event) => setPhone(event.target.value)}
                  value={phone}
                />
                {touched && !phoneValid ? (
                  <p className='text-sm text-error' id='caregiver-phone-error'>
                    {t('caregiver.me.info.phoneInvalid')}
                  </p>
                ) : null}
                <div className='flex gap-2'>
                  <Button loading={save.isPending} size='sm' type='submit'>
                    {t('caregiver.ui.actions.save')}
                  </Button>
                  <Button disabled={save.isPending} onClick={() => setEditing(false)} size='sm' variant='ghost'>
                    {t('caregiver.ui.actions.cancel')}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <span className='tabular-nums'>{formatPhone(user?.phoneNumber) || t('caregiver.me.info.notSet')}</span>
                <Button
                  disabled={!user}
                  leftIcon={<Icon className='text-base' name='edit' />}
                  onClick={() => {
                    setPhone(user?.phoneNumber ?? '')
                    setTouched(false)
                    setEditing(true)
                  }}
                  size='sm'
                  variant='ghost'
                >
                  {t('caregiver.ui.actions.edit')}
                </Button>
              </>
            )}
          </Field>
        </dl>
      </section>

      <div className='flex flex-col gap-4'>
        <section aria-labelledby='info-about' className={`${cgCard} p-4 sm:p-5`}>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='text-base font-semibold text-on-surface' id='info-about'>
              {t('caregiver.me.info.about')}
            </h2>
          </div>
          <p className='mt-2 text-[15px] whitespace-pre-line text-on-surface'>
            {profile.bio || <span className='text-on-surface-variant'>{t('caregiver.me.info.aboutEmpty')}</span>}
          </p>
        </section>

        <section aria-labelledby='info-services' className={`${cgCard} p-4 sm:p-5`}>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='text-base font-semibold text-on-surface' id='info-services'>
              {t('caregiver.me.info.services')}
            </h2>
          </div>
          <p className='mt-1 text-sm text-on-surface-variant'>{t('caregiver.me.info.servicesHint')}</p>
          {services.isError ? (
            <p className='mt-3 text-sm text-error' role='alert'>
              {t('caregiver.me.info.servicesError')}
            </p>
          ) : null}
          {services.isSuccess && services.data.length === 0 ? (
            <p className='mt-3 rounded-lg bg-warning-container p-3 text-sm text-on-warning-container'>
              {t('caregiver.me.info.servicesEmpty')}
            </p>
          ) : null}
          {services.isSuccess && services.data.length > 0 ? (
            <ul className='mt-3 flex flex-wrap gap-2'>
              {services.data.map((service) => (
                <li
                  className='inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-primary'
                  key={service.centerServiceId}
                >
                  <Icon className='text-base' name='check_circle' />
                  {service.serviceName}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  )
}
