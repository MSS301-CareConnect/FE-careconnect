import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { changeCaregiverStatus, providerKeys, saveCaregiver } from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Select, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'

const key = 'centerManager.provider' as const
const genderOptions = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const
const statusOptions = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended' } as const

/** Edit a caregiver's profile and work status in a centred two-column popup. */
export function CaregiverEditorDialog({ person, onClose }: { person: ProviderCaregiverRecord; onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(person.fullName)
  const [experience, setExperience] = useState(String(person.experienceYears ?? 0))
  const [bio, setBio] = useState(person.bio ?? '')
  const [status, setStatus] = useState(person.caregiverStatus)
  const [birthDate, setBirthDate] = useState(person.dateOfBirth ?? '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>(person.gender ?? '')
  const [submitted, setSubmitted] = useState(false)
  const canActivate = person.verificationStatus === 'VERIFIED'
  const years = Number(experience)
  const errors = {
    name: !name.trim() ? t(`${key}.editor.nameRequired`) : undefined,
    experience:
      experience === '' || !Number.isInteger(years) || years < 0 || years > 80
        ? t(`${key}.editor.experienceInvalid`)
        : undefined
  }
  const update = useMutation({
    mutationFn: async () => {
      // M-12: ProviderService changes status only through its own PATCH (it also flags the caregiver's visits, H-11).
      // The PATCH runs first because it flushes and returns the new version; the profile PUT returns it before flushing.
      const version =
        status === person.caregiverStatus
          ? person.version
          : (await changeCaregiverStatus(person.id, { status, version: person.version })).version
      await saveCaregiver(person.id, {
        fullName: name.trim(),
        experienceYears: years,
        bio: bio.trim() || undefined,
        dateOfBirth: birthDate || undefined,
        gender: gender || undefined,
        version
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregiver(person.id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(person.centerId) })
      toastSuccess(t(`${key}.editor.saved`))
      onClose()
    }
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!errors.name && !errors.experience) update.mutate()
  }

  return (
    <Modal
      dismissOnBackdrop={false}
      footer={
        <>
          <Button onClick={onClose} variant='outline'>
            {t(`${key}.cancel`)}
          </Button>
          <Button form='caregiver-editor' loading={update.isPending} type='submit'>
            {t(`${key}.save`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='lg'
      title={t(`${key}.editCaregiver`)}
    >
      <form className='grid gap-4 sm:grid-cols-2' id='caregiver-editor' noValidate onSubmit={submit}>
        <FormField error={submitted ? errors.name : undefined} label={t(`${key}.caregiverName`)}>
          {(control) => (
            <Input {...control} maxLength={150} onChange={(event) => setName(event.target.value)} value={name} />
          )}
        </FormField>
        <FormField error={submitted ? errors.experience : undefined} label={t(`${key}.experience`)}>
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
              <option value=''>{t(`${key}.unknown`)}</option>
              {(Object.keys(genderOptions) as (keyof typeof genderOptions)[]).map((value) => (
                <option key={value} value={value}>
                  {t(`${key}.${genderOptions[value]}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t(`${key}.birthDate`)}>
          {(control) => <DatePicker {...control} defaultMonth='1990-01-01' onChange={setBirthDate} value={birthDate} />}
        </FormField>
        <FormField
          className='sm:col-span-2'
          hint={canActivate ? undefined : t(`${key}.editor.activateHint`)}
          label={t(`${key}.status`)}
        >
          {(control) => (
            <Select {...control} onChange={(event) => setStatus(event.target.value as typeof status)} value={status}>
              {(Object.keys(statusOptions) as (keyof typeof statusOptions)[]).map((value) => (
                // PRV-06: only a verified caregiver can be made active.
                <option
                  disabled={value === 'ACTIVE' && !canActivate && person.caregiverStatus !== 'ACTIVE'}
                  key={value}
                  value={value}
                >
                  {t(`${key}.${statusOptions[value]}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField className='sm:col-span-2' label={t(`${key}.bio`)}>
          {(control) => (
            <Textarea {...control} maxLength={2000} onChange={(event) => setBio(event.target.value)} value={bio} />
          )}
        </FormField>
        {update.isError ? (
          <FormAlert className='sm:col-span-2' tone='error'>
            {t(apiRequestErrorKey(update.error, `${key}.actionError`))}
          </FormAlert>
        ) : null}
      </form>
    </Modal>
  )
}
