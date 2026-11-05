import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { careRecipientKeys, createRecipientProfile } from '~/entities/care-recipient/care-recipient-api'
import type {
  CareRecipientCreateRequestGender,
  CareRecipientCreateRequestRelationshipType
} from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { FormField, Input, Select } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'

/** "This person is your father" → the customer is their CHILD, as the profile form stores it. */
const RELATIONSHIPS = [
  'CHILD',
  'GRANDCHILD',
  'SPOUSE',
  'SIBLING',
  'PARENT',
  'SELF',
  'RELATIVE',
  'OTHER'
] as const satisfies readonly CareRecipientCreateRequestRelationshipType[]
const GENDERS = ['FEMALE', 'MALE', 'OTHER'] as const satisfies readonly CareRecipientCreateRequestGender[]

interface QuickProfile {
  fullName: string
  relationshipType: '' | CareRecipientCreateRequestRelationshipType
  dateOfBirth: string
  gender: '' | CareRecipientCreateRequestGender
  phoneNumber: string
  addressLine: string
  district: string
  province: string
}

const EMPTY: QuickProfile = {
  fullName: '',
  relationshipType: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  addressLine: '',
  district: '',
  province: ''
}

/** Creates a basic family profile in a centred two-column dialog without leaving the booking, then selects it. */
export function RecipientQuickCreate({
  open,
  onClose,
  onCreated
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [value, setValue] = useState<QuickProfile>(EMPTY)
  const [touched, setTouched] = useState(false)
  const create = useMutation({
    mutationFn: () =>
      createRecipientProfile({
        fullName: value.fullName.trim(),
        relationshipType: value.relationshipType as CareRecipientCreateRequestRelationshipType,
        dateOfBirth: value.dateOfBirth || undefined,
        gender: value.gender || undefined,
        phoneNumber: value.phoneNumber.trim() || undefined,
        addressLine: value.addressLine.trim() || undefined,
        district: value.district.trim() || undefined,
        province: value.province.trim() || undefined
      }),
    onSuccess: async (profile) => {
      await queryClient.invalidateQueries({ queryKey: careRecipientKeys.all })
      setValue(EMPTY)
      setTouched(false)
      onCreated(profile.profile.id)
    }
  })
  const nameError = touched && !value.fullName.trim() ? t('customer.booking.quickCreate.required') : undefined
  const relationError = touched && !value.relationshipType ? t('customer.booking.quickCreate.required') : undefined
  const set = (patch: Partial<QuickProfile>) => setValue((current) => ({ ...current, ...patch }))

  function submit() {
    setTouched(true)
    if (!value.fullName.trim() || !value.relationshipType) return
    create.mutate()
  }

  return (
    <Modal
      dismissOnBackdrop={false}
      description={t('customer.booking.quickCreate.description')}
      footer={
        <>
          <Button onClick={onClose} variant='ghost'>
            {t('customer.booking.quickCreate.cancel')}
          </Button>
          <Button loading={create.isPending} onClick={submit}>
            {t('customer.booking.quickCreate.submit')}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size='xl'
      title={t('customer.booking.quickCreate.title')}
    >
      <form
        className='grid gap-4 md:grid-cols-2'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <FormField error={nameError} label={t('customer.booking.quickCreate.fullName')}>
          {(props) => (
            <Input
              {...props}
              autoComplete='off'
              onChange={(event) => set({ fullName: event.target.value })}
              value={value.fullName}
            />
          )}
        </FormField>
        <FormField error={relationError} label={t('customer.booking.quickCreate.relationship')}>
          {(props) => (
            <Select
              {...props}
              onChange={(event) => set({ relationshipType: event.target.value as QuickProfile['relationshipType'] })}
              value={value.relationshipType}
            >
              <option disabled value=''>
                {t('customer.booking.quickCreate.chooseRelationship')}
              </option>
              {RELATIONSHIPS.map((item) => (
                <option key={item} value={item}>
                  {t(`customer.booking.quickCreate.relationshipOptions.${item}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField label={t('customer.booking.quickCreate.dateOfBirth')}>
            {(props) => (
              <DatePicker
                {...props}
                defaultMonth='1950-01-01'
                onChange={(dateOfBirth) => set({ dateOfBirth })}
                value={value.dateOfBirth}
              />
            )}
          </FormField>
          <FormField label={t('customer.booking.quickCreate.gender')}>
            {(props) => (
              <Select
                {...props}
                onChange={(event) => set({ gender: event.target.value as QuickProfile['gender'] })}
                value={value.gender}
              >
                <option value=''>{t('customer.booking.quickCreate.genderNone')}</option>
                {GENDERS.map((item) => (
                  <option key={item} value={item}>
                    {t(`customer.careRecipient.gender.${item}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
        <FormField label={t('customer.booking.quickCreate.phone')}>
          {(props) => (
            <Input
              {...props}
              inputMode='tel'
              onChange={(event) => set({ phoneNumber: event.target.value })}
              value={value.phoneNumber}
            />
          )}
        </FormField>
        <FormField label={t('customer.booking.quickCreate.addressLine')}>
          {(props) => (
            <Input
              {...props}
              onChange={(event) => set({ addressLine: event.target.value })}
              value={value.addressLine}
            />
          )}
        </FormField>
        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField label={t('customer.booking.quickCreate.district')}>
            {(props) => (
              <Input {...props} onChange={(event) => set({ district: event.target.value })} value={value.district} />
            )}
          </FormField>
          <FormField label={t('customer.booking.quickCreate.province')}>
            {(props) => (
              <Input {...props} onChange={(event) => set({ province: event.target.value })} value={value.province} />
            )}
          </FormField>
        </div>
        {create.isError ? (
          <p className='rounded-lg bg-error-container p-3 text-sm text-on-error-container md:col-span-2' role='alert'>
            {t('customer.booking.quickCreate.error')}
          </p>
        ) : null}
        <button className='sr-only' tabIndex={-1} type='submit' />
      </form>
    </Modal>
  )
}
