import { type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientCreateFormData } from '../types'

export interface MedicalHistorySectionProps {
  formData: PatientCreateFormData
  onUpdate: <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => void
  onToggleChronic: (illnessKey: string) => void
  newAllergyText: string
  onNewAllergyChange: (value: string) => void
  onAddAllergy: () => void
  onRemoveAllergy: (allergy: string) => void
}

const CHRONIC_KEYS = [
  'hypertension',
  'diabetes',
  'strokeHistory',
  'heartDisease',
  'dementia',
  'osteoarthritis',
  'kidneyDisease',
  'copd'
] as const

const SECTION_STEP = '2'

export function MedicalHistorySection({
  formData,
  onUpdate,
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

          <div className='mt-1'>
            <input
              type='text'
              value={formData.otherChronic}
              onChange={(e) => onUpdate('otherChronic', e.target.value)}
              placeholder={t('customer.patientCreate.section2.otherChronicPlaceholder')}
              className='h-10 w-full rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
            />
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
              value={newAllergyText}
              onChange={(e) => onNewAllergyChange(e.target.value)}
              onKeyDown={handleAllergyKeyDown}
              placeholder={t('customer.patientCreate.section2.allergyInputPlaceholder')}
              className='h-10 flex-1 rounded-lg bg-surface-container-lowest px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-error focus:outline-none'
            />
            <button
              type='button'
              onClick={onAddAllergy}
              className='h-10 shrink-0 rounded-lg bg-error px-4 text-xs font-semibold text-on-error transition-colors hover:bg-on-error-container'
            >
              {t('customer.patientCreate.section2.addAllergyBtn')}
            </button>
          </div>
        </div>

        {/* Surgical History */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='surgeryHistoryTextarea' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section2.surgeryHistoryLabel')}
          </label>
          <textarea
            id='surgeryHistoryTextarea'
            rows={3}
            value={formData.surgeryHistory}
            onChange={(e) => onUpdate('surgeryHistory', e.target.value)}
            placeholder={t('customer.patientCreate.section2.surgeryHistoryPlaceholder')}
            className='rounded-lg bg-surface-container-low p-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all resize-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
          />
        </div>

        {/* Doctor and Contact */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='doctorNameInput' className='text-xs font-semibold text-on-surface'>
              {t('customer.patientCreate.section2.doctorNameLabel')}
            </label>
            <input
              id='doctorNameInput'
              type='text'
              value={formData.doctorName}
              onChange={(e) => onUpdate('doctorName', e.target.value)}
              placeholder={t('customer.patientCreate.section2.doctorNamePlaceholder')}
              className='h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='doctorContactInput' className='text-xs font-semibold text-on-surface'>
              {t('customer.patientCreate.section2.doctorContactLabel')}
            </label>
            <input
              id='doctorContactInput'
              type='tel'
              value={formData.doctorContact}
              onChange={(e) => onUpdate('doctorContact', e.target.value)}
              placeholder={t('customer.patientCreate.section2.doctorContactPlaceholder')}
              className='h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
            />
          </div>
        </div>
      </div>
    </section>
  )
}
