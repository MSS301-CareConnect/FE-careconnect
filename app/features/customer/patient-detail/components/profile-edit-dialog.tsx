import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressFields } from '~/entities/address/address-fields'
import { addressIssues, hasAddressIssues, normalizeAddress } from '~/entities/address/admin-units'
import { useAdminUnits } from '~/entities/address/use-admin-units'
import {
  CareRecipientUpdateRequestBloodType,
  CareRecipientUpdateRequestGender,
  CareRecipientUpdateRequestIndependenceLevel,
  CareRecipientUpdateRequestMobilityLevel
} from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { Modal } from '~/shared/ui/modal'

import type { EditSection } from '../hooks/use-profile-editor'
import type { ProfileDraft, ProfileDraftError } from '../profile-draft'
import { FormField, inputClassName } from './form-field'

const key = 'customer.patientDetail' as const
const FORM_ID = 'profile-section-form'
const ERROR_KEYS = {
  nameRequired: `${key}.banner.nameRequired`,
  phoneInvalid: `${key}.banner.phoneInvalid`,
  conflict: `${key}.banner.conflictError`,
  save: `${key}.banner.saveError`
} as const
const TEXTAREA = `${inputClassName} min-h-24`

/**
 * A centred dialog that edits one section of the profile, laid out in two columns on wide screens so a long section
 * fits without scrolling. The PUT behind it still sends the whole profile.
 */
export function ProfileEditDialog({
  section,
  draft,
  today,
  saving,
  error,
  onChange,
  onSubmit,
  onClose
}: {
  section: EditSection | null
  draft: ProfileDraft | null
  /** Latest selectable birth date (YYYY-MM-DD). */
  today: string
  saving: boolean
  error?: ProfileDraftError | 'conflict' | 'save'
  onChange: (partial: Partial<ProfileDraft>) => void
  onSubmit: (patch?: Partial<ProfileDraft>) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const units = useAdminUnits()
  const [addressTried, setAddressTried] = useState(false)
  if (!section || !draft) return null
  const address = { addressLine: draft.addressLine, ward: draft.ward, province: draft.province }
  const issues = section === 'address' ? addressIssues(address, units.data, { optional: true }) : {}

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (section === 'address') {
      setAddressTried(true)
      if (hasAddressIssues(issues)) return
      // The address is saved in today's two-level units, so a district from before 2025 is dropped.
      onSubmit({ ...normalizeAddress(address, units.data), district: '' })
      return
    }
    onSubmit()
  }

  const text = (field: keyof ProfileDraft, label: string, maxLength = 255, area = false, wide = false) => (
    <FormField className={wide ? 'sm:col-span-2' : undefined} key={field} label={label}>
      {area ? (
        <textarea
          className={TEXTAREA}
          maxLength={maxLength}
          onChange={(event) => onChange({ [field]: event.target.value })}
          rows={3}
          value={draft[field]}
        />
      ) : (
        <input
          className={inputClassName}
          maxLength={maxLength}
          onChange={(event) => onChange({ [field]: event.target.value })}
          type='text'
          value={draft[field]}
        />
      )}
    </FormField>
  )

  return (
    <Modal
      description={t(`${key}.drawer.${section}.description`)}
      footer={
        <>
          <Button disabled={saving} onClick={onClose} variant='outline'>
            {t(`${key}.drawer.cancel`)}
          </Button>
          <Button form={FORM_ID} loading={saving} type='submit'>
            {saving ? t(`${key}.banner.saving`) : t(`${key}.drawer.save`)}
          </Button>
        </>
      }
      dismissOnBackdrop={false}
      maxWidthClass='max-w-3xl'
      onClose={onClose}
      open
      title={t(`${key}.drawer.${section}.title`)}
    >
      <form className='grid gap-4 sm:grid-cols-2' id={FORM_ID} noValidate onSubmit={submit}>
        {error ? (
          <p
            className='rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container sm:col-span-2'
            role='alert'
          >
            {t(ERROR_KEYS[error])}
          </p>
        ) : null}

        {section === 'basic' ? (
          <>
            <FormField label={t(`${key}.snapshot.fullNameLabel`)}>
              <input
                aria-invalid={error === 'nameRequired' || undefined}
                autoComplete='off'
                className={inputClassName}
                maxLength={255}
                onChange={(event) => onChange({ fullName: event.target.value })}
                required
                type='text'
                value={draft.fullName}
              />
            </FormField>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-on-surface' htmlFor='profile-birth-date'>
                {t(`${key}.snapshot.dateOfBirthLabel`)}
              </label>
              <DatePicker
                defaultMonth='1950-01-01'
                id='profile-birth-date'
                max={today}
                onChange={(value) => onChange({ dateOfBirth: value })}
                value={draft.dateOfBirth}
              />
            </div>
            <FormField label={t(`${key}.snapshot.genderLabel`)}>
              <select
                className={inputClassName}
                onChange={(event) => onChange({ gender: event.target.value as ProfileDraft['gender'] })}
                value={draft.gender}
              >
                <option value=''>{t(`${key}.snapshot.selectPlaceholder`)}</option>
                {Object.values(CareRecipientUpdateRequestGender).map((gender) => (
                  <option key={gender} value={gender}>
                    {t(`customer.careRecipient.gender.${gender}`)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t(`${key}.snapshot.phoneNumberLabel`)}>
              <input
                aria-invalid={error === 'phoneInvalid' || undefined}
                autoComplete='off'
                className={inputClassName}
                inputMode='numeric'
                onChange={(event) => onChange({ phoneNumber: event.target.value })}
                type='tel'
                value={draft.phoneNumber}
              />
            </FormField>
            <FormField label={t(`${key}.snapshot.bloodTypeLabel`)}>
              <select
                className={inputClassName}
                onChange={(event) => onChange({ bloodType: event.target.value as ProfileDraft['bloodType'] })}
                value={draft.bloodType}
              >
                <option value=''>{t(`${key}.snapshot.selectPlaceholder`)}</option>
                {Object.values(CareRecipientUpdateRequestBloodType).map((type) => (
                  <option key={type} value={type}>
                    {type === 'UNKNOWN' ? t('customer.careRecipient.bloodType.UNKNOWN') : type}
                  </option>
                ))}
              </select>
            </FormField>
            <div className='grid grid-cols-2 gap-4'>
              <FormField label={t(`${key}.snapshot.heightLabel`)}>
                <input
                  className={inputClassName}
                  inputMode='decimal'
                  max={300}
                  min={0}
                  onChange={(event) => onChange({ heightCm: event.target.value })}
                  step='0.1'
                  type='number'
                  value={draft.heightCm}
                />
              </FormField>
              <FormField label={t(`${key}.snapshot.weightLabel`)}>
                <input
                  className={inputClassName}
                  inputMode='decimal'
                  max={500}
                  min={0}
                  onChange={(event) => onChange({ weightKg: event.target.value })}
                  step='0.1'
                  type='number'
                  value={draft.weightKg}
                />
              </FormField>
            </div>
          </>
        ) : null}

        {section === 'address' ? (
          <AddressFields
            className='sm:col-span-2'
            idPrefix='profile-address'
            issues={addressTried ? issues : undefined}
            lineMaxLength={500}
            onChange={(next) => onChange({ ...next, district: '' })}
            value={address}
          />
        ) : null}

        {section === 'medical'
          ? [
              text('chronicConditions', t(`${key}.medicalBackground.chronicLabel`), 5000, true),
              text('allergies', t(`${key}.medicalBackground.allergyLabel`), 5000, true),
              text('medicalHistory', t(`${key}.medicalBackground.historyLabel`), 5000, true, true)
            ]
          : null}

        {section === 'daily' ? (
          <>
            <FormField label={t(`${key}.carePlan.mobilityLabel`)}>
              <select
                className={inputClassName}
                onChange={(event) => onChange({ mobilityLevel: event.target.value as ProfileDraft['mobilityLevel'] })}
                value={draft.mobilityLevel}
              >
                <option value=''>{t(`${key}.carePlan.selectPlaceholder`)}</option>
                {Object.values(CareRecipientUpdateRequestMobilityLevel).map((level) => (
                  <option key={level} value={level}>
                    {t(`customer.careRecipient.mobility.${level}`)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t(`${key}.carePlan.independenceLabel`)}>
              <select
                className={inputClassName}
                onChange={(event) =>
                  onChange({ independenceLevel: event.target.value as ProfileDraft['independenceLevel'] })
                }
                value={draft.independenceLevel}
              >
                <option value=''>{t(`${key}.carePlan.selectPlaceholder`)}</option>
                {Object.values(CareRecipientUpdateRequestIndependenceLevel).map((level) => (
                  <option key={level} value={level}>
                    {t(`customer.careRecipient.independence.${level}`)}
                  </option>
                ))}
              </select>
            </FormField>
            {text('dietaryNotes', t(`${key}.carePlan.nutritionTitle`), 5000, true)}
            {text('sleepHabits', t(`${key}.carePlan.sleepTitle`), 5000, true)}
            {text('behaviorNotes', t(`${key}.carePlan.behaviorTitle`), 5000, true)}
            {text('careRequirements', t(`${key}.carePlan.requirementsTitle`), 5000, true)}
          </>
        ) : null}
      </form>
    </Modal>
  )
}
