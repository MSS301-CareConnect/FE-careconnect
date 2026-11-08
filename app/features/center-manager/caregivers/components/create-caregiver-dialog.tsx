import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { createCaregiver, providerKeys } from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Select, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { provisionCaregiverAccount } from '../caregiver-onboarding-api'

const key = 'centerManager.provider' as const
const c = 'centerManager.provider.create' as const
const genderOptions = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^0\d{9,10}$/

function Section({ icon, title, hint, children }: { icon: string; title: string; hint: string; children: ReactNode }) {
  return (
    <fieldset className='rounded-2xl border border-outline-variant/50 px-4 pt-2 pb-4 sm:px-5'>
      <legend className='flex items-center gap-2 px-1.5 text-sm font-bold text-on-surface'>
        <Icon className='text-lg text-primary' name={icon} />
        {title}
      </legend>
      <p className='mb-3 text-xs leading-5 text-on-surface-variant'>{hint}</p>
      <div className='grid gap-4 sm:grid-cols-2'>{children}</div>
    </fieldset>
  )
}

/**
 * Add a caregiver: IdentityService creates the CAREGIVER account (the person sets a password from the emailed code),
 * then ProviderService creates the center profile. If the profile step fails, the account ID is kept so "retry" saves
 * only the profile and never creates a second account.
 */
export function CreateCaregiverDialog({ centerId, onClose }: { centerId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [accountId, setAccountId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [experience, setExperience] = useState('0')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bio, setBio] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const years = Number(experience)
  const errors = {
    email: !email.trim()
      ? t(`${c}.errors.emailRequired`)
      : !EMAIL.test(email.trim())
        ? t(`${c}.errors.email`)
        : undefined,
    fullName: !fullName.trim() ? t(`${key}.editor.nameRequired`) : undefined,
    phone: phoneNumber.trim() && !PHONE.test(phoneNumber.trim()) ? t(`${c}.errors.phone`) : undefined,
    experience:
      experience === '' || !Number.isInteger(years) || years < 0 || years > 80
        ? t(`${key}.editor.experienceInvalid`)
        : undefined,
    bio: bio.length > 2000 ? t(`${c}.errors.bio`) : undefined
  }
  const show = (message: string | undefined) => (submitted ? message : undefined)

  const create = useMutation({
    mutationFn: async () => {
      const userId =
        accountId ?? (await provisionCaregiverAccount(email.trim(), fullName.trim(), phoneNumber.trim() || undefined))
      setAccountId(userId)
      return createCaregiver(centerId, {
        userId,
        fullName: fullName.trim(),
        experienceYears: years,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        bio: bio.trim() || undefined
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(centerId) })
      toastSuccess(t(`${c}.created`, { name: fullName.trim() }))
      onClose()
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!Object.values(errors).some(Boolean)) create.mutate()
  }

  return (
    <Modal
      description={t(`${key}.createCaregiverHint`)}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button disabled={Boolean(accountId) || create.isPending} onClick={onClose} variant='outline'>
            {t(`${key}.cancel`)}
          </Button>
          <Button
            form='create-caregiver-form'
            leftIcon={<Icon name={accountId ? 'refresh' : 'person_add'} />}
            loading={create.isPending}
            type='submit'
          >
            {t(accountId ? `${key}.retryProfile` : `${key}.save`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='xl'
      title={t(`${key}.createCaregiver`)}
    >
      <form className='space-y-4' id='create-caregiver-form' noValidate onSubmit={submit}>
        <Section hint={t(`${c}.accountHint`)} icon='badge' title={t(`${c}.account`)}>
          <FormField error={show(errors.email)} label={t(`${key}.email`)}>
            {(control) => (
              <Input
                {...control}
                autoComplete='off'
                disabled={Boolean(accountId)}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t(`${c}.emailPlaceholder`)}
                type='email'
                value={email}
              />
            )}
          </FormField>
          <FormField error={show(errors.phone)} hint={t(`${c}.phoneHint`)} label={t(`${key}.phoneNumber`)}>
            {(control) => (
              <Input
                {...control}
                disabled={Boolean(accountId)}
                inputMode='numeric'
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder={t(`${c}.phonePlaceholder`)}
                type='tel'
                value={phoneNumber}
              />
            )}
          </FormField>
        </Section>

        <Section hint={t(`${c}.profileHint`)} icon='person' title={t(`${c}.profile`)}>
          <FormField error={show(errors.fullName)} label={t(`${key}.caregiverName`)}>
            {(control) => (
              <Input
                {...control}
                disabled={Boolean(accountId)}
                maxLength={150}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={t(`${c}.namePlaceholder`)}
                value={fullName}
              />
            )}
          </FormField>
          <FormField error={show(errors.experience)} label={t(`${key}.experience`)}>
            {(control) => (
              <Input
                {...control}
                inputMode='numeric'
                max={80}
                min={0}
                onChange={(event) => setExperience(event.target.value)}
                type='number'
                value={experience}
              />
            )}
          </FormField>
          <FormField label={t(`${key}.gender`)}>
            {(control) => (
              <Select {...control} onChange={(event) => setGender(event.target.value as typeof gender)} value={gender}>
                <option value=''>{t(`${c}.genderUnset`)}</option>
                {(Object.keys(genderOptions) as (keyof typeof genderOptions)[]).map((value) => (
                  <option key={value} value={value}>
                    {t(`${key}.${genderOptions[value]}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t(`${key}.birthDate`)}>
            {(control) => (
              <DatePicker {...control} defaultMonth='1990-01-01' onChange={setDateOfBirth} value={dateOfBirth} />
            )}
          </FormField>

          <FormField className='sm:col-span-2' error={show(errors.bio)} label={t(`${key}.bio`)}>
            {(control) => (
              <Textarea
                {...control}
                className='min-h-20'
                maxLength={2000}
                rows={2}
                onChange={(event) => setBio(event.target.value)}
                placeholder={t(`${c}.bioPlaceholder`)}
                value={bio}
              />
            )}
          </FormField>
        </Section>

        {create.isError ? (
          <FormAlert tone='error'>
            {accountId
              ? t(`${key}.profileAfterAccountError`)
              : t(apiRequestErrorKey(create.error, `${key}.actionError`))}
          </FormAlert>
        ) : null}
      </form>
    </Modal>
  )
}
