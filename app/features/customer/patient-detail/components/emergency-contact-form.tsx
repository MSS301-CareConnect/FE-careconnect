import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { EmergencyContactRecord, EmergencyContactRequest } from '~/shared/api/generated/contracts'

import { PHONE_PATTERN } from '../profile-draft'
import { FormField, inputClassName } from './form-field'

export interface EmergencyContactFormProps {
  contact?: EmergencyContactRecord
  isSaving: boolean
  onSubmit: (request: EmergencyContactRequest) => void
  onCancel: () => void
}

export function EmergencyContactForm({ contact, isSaving, onSubmit, onCancel }: EmergencyContactFormProps) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(contact?.fullName ?? '')
  const [relationship, setRelationship] = useState(contact?.relationship ?? '')
  const [phoneNumber, setPhoneNumber] = useState(contact?.phoneNumber ?? '')
  const [priority, setPriority] = useState(String(contact?.priority ?? 0))
  const [primary, setPrimary] = useState(contact?.primary ?? false)
  const [error, setError] = useState<'required' | 'phoneInvalid'>()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const phone = phoneNumber.trim()
    if (!fullName.trim() || !relationship.trim() || !phone) return setError('required')
    if (!PHONE_PATTERN.test(phone)) return setError('phoneInvalid')
    setError(undefined)
    onSubmit({
      fullName: fullName.trim(),
      relationship: relationship.trim(),
      phoneNumber: phone,
      priority: priority.trim() ? Number(priority) : undefined,
      primary
    })
  }

  return (
    <form onSubmit={submit} className='grid grid-cols-2 gap-3 rounded-lg bg-surface-container-low p-3' noValidate>
      <FormField label={t('customer.patientDetail.emergencySection.fullNameLabel')} className='col-span-2'>
        <input
          type='text'
          maxLength={255}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.emergencySection.relationshipLabel')}>
        <input
          type='text'
          maxLength={100}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.emergencySection.phoneNumberLabel')}>
        <input
          type='tel'
          inputMode='numeric'
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <FormField label={t('customer.patientDetail.emergencySection.priorityLabel')}>
        <input
          type='number'
          min={0}
          max={100}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={inputClassName}
        />
      </FormField>
      <label className='flex items-center gap-2 self-end pb-2 text-xs text-on-surface'>
        <input type='checkbox' checked={primary} onChange={(e) => setPrimary(e.target.checked)} />
        <span>{t('customer.patientDetail.emergencySection.primaryLabel')}</span>
      </label>
      {error ? (
        <p role='alert' className='col-span-2 text-xs text-error'>
          {t(`customer.patientDetail.emergencySection.${error}`)}
        </p>
      ) : null}
      <div className='col-span-2 flex gap-2'>
        <button
          type='submit'
          disabled={isSaving}
          className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-60'
        >
          {t('customer.patientDetail.emergencySection.save')}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg bg-surface-container-lowest px-3 py-2 text-xs font-medium text-on-surface'
        >
          {t('customer.patientDetail.emergencySection.cancel')}
        </button>
      </div>
    </form>
  )
}
