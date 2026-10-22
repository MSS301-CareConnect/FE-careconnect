import { type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { CHRONIC_KEYS, type PatientCreateErrors } from '../patient-create-request'
import type { EmergencyContactDraft, PatientCreateFormData } from '../types'
import { FieldError, fieldErrorProps, invalidClassName } from './field-error'

export interface MedicalHistorySectionProps {
  formData: PatientCreateFormData
  errors: PatientCreateErrors
  onUpdate: <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => void
  onEmergencyContactChange: (partial: Partial<EmergencyContactDraft>) => void
  onToggleChronic: (illnessKey: string) => void
  newAllergyText: string
  onNewAllergyChange: (value: string) => void
  onAddAllergy: () => void
  onRemoveAllergy: (allergy: string) => void
}

const SECTION_STEP = '2'
const inputClass = `h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`

export function MedicalHistorySection({
  formData,
  errors,
  onUpdate,
  onEmergencyContactChange,
  onToggleChronic,
  newAllergyText,
  onNewAllergyChange,
  onAddAllergy,
  onRemoveAllergy
}: MedicalHistorySectionProps) {
  const { t } = useTranslation()

  const handleAllergyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddAllergy()
    }
  }

  return (
    <section className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Section Header */}
      <div className='mb-6 flex items-center justify-between border-b border-surface-container-low pb-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
            {SECTION_STEP}
          </span>
          <div>
            <h2 className='text-xl font-bold text-on-surface'>{t('customer.patientCreate.section2.title')}</h2>
            <p className='text-xs text-on-surface-variant'>{t('customer.patientCreate.section2.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-6'>
        {/* Chronic illnesses checkboxes */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <label className='text-xs font-semibold text-on-surface'>
              {t('customer.patientCreate.section2.chronicLabel')}
            </label>
            <span className='text-[11px] text-on-surface-variant'>
              {t('customer.patientCreate.section2.multiSelectHint')}
            </span>
          </div>

          <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
            {CHRONIC_KEYS.map((key) => {
              const isChecked = formData.chronicIllnesses.includes(key)
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 text-xs transition-colors ${
                    isChecked
                      ? 'bg-secondary-container/30 text-on-surface font-medium'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={isChecked}
                    onChange={() => onToggleChronic(key)}
                    className='h-4 w-4 rounded accent-primary'
                  />
                  <span>{t(`customer.patientCreate.section2.chronicOptions.${key}`)}</span>
                </label>
              )
            })}
          </div>

          <div className='mt-1 flex flex-col gap-1.5'>
            <input
              type='text'
              maxLength={1000}
              value={formData.otherChronic}
              onChange={(e) => onUpdate('otherChronic', e.target.value)}
              aria-label={t('customer.patientCreate.section2.otherChronicPlaceholder')}
              placeholder={t('customer.patientCreate.section2.otherChronicPlaceholder')}
              {...fieldErrorProps('otherChronic', errors)}
              className={`h-10 w-full rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
            />
            <FieldError field='otherChronic' errors={errors} />
          </div>
        </div>

        {/* Medical & Food Allergies Box */}
        <div className='flex flex-col gap-3 rounded-xl bg-error-container/40 p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-error'>
              <Icon name='warning' className='text-xl' />
              <h3 className='text-sm font-bold text-on-error-container'>
                {t('customer.patientCreate.section2.allergiesTitle')}
              </h3>
            </div>
            <span className='rounded bg-error px-2 py-0.5 text-[10px] font-bold text-on-error uppercase'>
              {t('customer.patientCreate.section2.allergiesBadge')}
            </span>
          </div>
          <p className='text-xs text-on-error-container leading-relaxed'>
            {t('customer.patientCreate.section2.allergiesDesc')}
          </p>

          {/* Allergy Tags Container */}
          <div className='flex flex-wrap items-center gap-2 pt-1'>
            {formData.allergies.map((allergy) => (
              <span
                key={allergy}
                className='inline-flex items-center gap-2 rounded-full bg-error px-3 py-1 text-xs text-on-error'
              >
                <span>{allergy}</span>
                <button
                  type='button'
                  onClick={() => onRemoveAllergy(allergy)}
                  aria-label={t('customer.patientCreate.section2.removeAllergy')}
                  className='hover:opacity-75'
                >
                  <Icon name='close' className='text-xs' />
                </button>
              </span>
            ))}
          </div>

          {/* Add Allergy Input */}
          <div className='mt-2 flex items-center gap-3'>
            <input
              type='text'
              maxLength={255}
              value={newAllergyText}
              onChange={(e) => onNewAllergyChange(e.target.value)}
              onKeyDown={handleAllergyKeyDown}
              aria-label={t('customer.patientCreate.section2.allergyInputPlaceholder')}
              placeholder={t('customer.patientCreate.section2.allergyInputPlaceholder')}
              {...fieldErrorProps('allergies', errors)}
              className={`h-10 flex-1 rounded-lg bg-surface-container-lowest px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-error focus:outline-none ${invalidClassName}`}
            />
            <button
              type='button'
              onClick={onAddAllergy}
              className='h-10 shrink-0 rounded-lg bg-error px-4 text-xs font-semibold text-on-error transition-colors hover:bg-on-error-container'
            >
              {t('customer.patientCreate.section2.addAllergyBtn')}
            </button>
          </div>
          <FieldError field='allergies' errors={errors} />
        </div>

        {/* Surgical History */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='surgeryHistoryTextarea' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section2.surgeryHistoryLabel')}
          </label>
          <textarea
            id='surgeryHistoryTextarea'
            rows={3}
            maxLength={5000}
            value={formData.surgeryHistory}
            onChange={(e) => onUpdate('surgeryHistory', e.target.value)}
            placeholder={t('customer.patientCreate.section2.surgeryHistoryPlaceholder')}
            {...fieldErrorProps('surgeryHistory', errors)}
            className={`rounded-lg bg-surface-container-low p-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all resize-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
          />
          <FieldError field='surgeryHistory' errors={errors} />
        </div>

        {/* Primary emergency contact (optional) */}
        <div className='flex flex-col gap-3'>
          <div>
            <h3 className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
              <Icon name='e911_emergency' className='text-base text-error' />
              <span>{t('customer.patientCreate.section2.emergencyTitle')}</span>
            </h3>
            <p className='mt-1 text-[11px] text-on-surface-variant'>
              {t('customer.patientCreate.section2.emergencyDesc')}
            </p>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='emergencyNameInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section2.emergencyNameLabel')}
              </label>
              <input
                id='emergencyNameInput'
                type='text'
                maxLength={255}
                value={formData.emergencyContact.fullName}
                onChange={(e) => onEmergencyContactChange({ fullName: e.target.value })}
                placeholder={t('customer.patientCreate.section2.emergencyNamePlaceholder')}
                {...fieldErrorProps('emergencyName', errors)}
                className={inputClass}
              />
              <FieldError field='emergencyName' errors={errors} />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='emergencyRelationshipInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section2.emergencyRelationshipLabel')}
              </label>
              <input
                id='emergencyRelationshipInput'
                type='text'
                maxLength={100}
                value={formData.emergencyContact.relationship}
                onChange={(e) => onEmergencyContactChange({ relationship: e.target.value })}
                placeholder={t('customer.patientCreate.section2.emergencyRelationshipPlaceholder')}
                {...fieldErrorProps('emergencyRelationship', errors)}
                className={inputClass}
              />
              <FieldError field='emergencyRelationship' errors={errors} />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='emergencyPhoneInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section2.emergencyPhoneLabel')}
              </label>
              <input
                id='emergencyPhoneInput'
                type='tel'
                inputMode='numeric'
                maxLength={15}
                value={formData.emergencyContact.phoneNumber}
                onChange={(e) => onEmergencyContactChange({ phoneNumber: e.target.value })}
                placeholder={t('customer.patientCreate.section2.emergencyPhonePlaceholder')}
                {...fieldErrorProps('emergencyPhone', errors)}
                className={inputClass}
              />
              <FieldError field='emergencyPhone' errors={errors} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
