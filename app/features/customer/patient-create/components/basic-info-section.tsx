import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { CareRecipientCreateRequestBloodType, CareRecipientCreateRequestGender } from '~/shared/api/generated/contracts'

import { localIsoDate, type PatientCreateErrors } from '../patient-create-request'
import type { BmiResult, PatientCreateFormData, Relationship } from '../types'
import { FieldError, fieldErrorProps, invalidClassName } from './field-error'

export interface BasicInfoSectionProps {
  formData: PatientCreateFormData
  bmi: BmiResult
  errors: PatientCreateErrors
  onUpdate: <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => void
}

const BLOOD_TYPES = Object.values(CareRecipientCreateRequestBloodType)
const GENDERS = Object.values(CareRecipientCreateRequestGender)
const RELATIONSHIPS: Relationship[] = ['father', 'mother', 'spouse', 'child', 'grandparent', 'sibling', 'other']
const STEP_1 = '1'
const CM_UNIT = 'cm'
const KG_UNIT = 'kg'

export function BasicInfoSection({ formData, bmi, errors, onUpdate }: BasicInfoSectionProps) {
  const { t } = useTranslation()

  const getBmiBadgeClass = () => {
    switch (bmi.status) {
      case 'underweight':
        return 'bg-surface-container-highest text-on-surface'
      case 'normal':
        return 'bg-secondary-container/50 text-on-secondary-container'
      case 'overweight':
        return 'bg-error-container text-on-error-container'
      case 'obese':
        return 'bg-error text-on-error'
    }
  }

  return (
    <section className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Section Header */}
      <div className='mb-6 flex items-center justify-between border-b border-surface-container-low pb-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
            {STEP_1}
          </span>
          <div>
            <h2 className='text-xl font-bold text-on-surface'>{t('customer.patientCreate.section1.title')}</h2>
            <p className='text-xs text-on-surface-variant'>{t('customer.patientCreate.section1.subtitle')}</p>
          </div>
        </div>
        <span className='text-xs text-error'>{t('customer.patientCreate.section1.requiredNote')}</span>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Full Name */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <label htmlFor='fullNameInput' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.fullNameLabel')} <span className='text-error'>*</span>
          </label>
          <input
            id='fullNameInput'
            type='text'
            maxLength={255}
            value={formData.fullName}
            onChange={(e) => onUpdate('fullName', e.target.value)}
            placeholder={t('customer.patientCreate.section1.fullNamePlaceholder')}
            {...fieldErrorProps('fullName', errors)}
            className={`h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
          />
          <FieldError field='fullName' errors={errors} />
          <span className='text-[11px] text-on-surface-variant'>
            {t('customer.patientCreate.section1.fullNameHint')}
          </span>
        </div>

        {/* Relationship */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='relationshipSelect' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.relationshipLabel')} <span className='text-error'>*</span>
          </label>
          <div className='relative'>
            <select
              id='relationshipSelect'
              value={formData.relationship}
              onChange={(e) => onUpdate('relationship', e.target.value as Relationship)}
              {...fieldErrorProps('relationship', errors)}
              className={`h-11 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low px-4 pr-10 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
            >
              <option value='' disabled>
                {t('customer.patientCreate.section1.relationshipPlaceholder')}
              </option>
              {RELATIONSHIPS.map((relationship) => (
                <option key={relationship} value={relationship}>
                  {t(`customer.patientCreate.section1.relationshipOptions.${relationship}`)}
                </option>
              ))}
            </select>
            <Icon
              name='expand_more'
              className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant'
            />
          </div>
          <FieldError field='relationship' errors={errors} />
        </div>

        {/* Birth Date */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='birthDateInput' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.birthDateLabel')} <span className='text-error'>*</span>
          </label>
          <input
            id='birthDateInput'
            type='date'
            max={localIsoDate()}
            value={formData.birthDate}
            onChange={(e) => onUpdate('birthDate', e.target.value)}
            {...fieldErrorProps('birthDate', errors)}
            className={`h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
          />
          <FieldError field='birthDate' errors={errors} />
        </div>

        {/* Gender */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <span id='genderLabel' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.genderLabel')} <span className='text-error'>*</span>
          </span>
          <div
            role='radiogroup'
            aria-labelledby='genderLabel'
            {...fieldErrorProps('gender', errors)}
            className={`flex flex-wrap gap-3 rounded-lg ${invalidClassName}`}
          >
            {GENDERS.map((genderVal) => (
              <label
                key={genderVal}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-colors ${
                  formData.gender === genderVal
                    ? 'bg-secondary-container/40 text-on-secondary-container'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <input
                  type='radio'
                  name='gender'
                  value={genderVal}
                  checked={formData.gender === genderVal}
                  onChange={() => onUpdate('gender', genderVal)}
                  className='h-4 w-4 accent-primary'
                />
                <span>{t(`customer.careRecipient.gender.${genderVal}`)}</span>
              </label>
            ))}
          </div>
          <FieldError field='gender' errors={errors} />
        </div>

        {/* Height, Weight, BMI */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <div className='grid grid-cols-1 items-end gap-3 sm:grid-cols-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='heightInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section1.heightLabel')}
              </label>
              <div className='relative'>
                <input
                  id='heightInput'
                  type='number'
                  min='1'
                  max='300'
                  value={formData.height}
                  onChange={(e) => onUpdate('height', e.target.value === '' ? '' : Number(e.target.value))}
                  {...fieldErrorProps('height', errors)}
                  className={`h-11 w-full rounded-lg bg-surface-container-low px-4 pr-12 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
                />
                <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-on-surface-variant'>
                  {CM_UNIT}
                </span>
              </div>
              <FieldError field='height' errors={errors} />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='weightInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section1.weightLabel')}
              </label>
              <div className='relative'>
                <input
                  id='weightInput'
                  type='number'
                  min='1'
                  max='500'
                  value={formData.weight}
                  onChange={(e) => onUpdate('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  {...fieldErrorProps('weight', errors)}
                  className={`h-11 w-full rounded-lg bg-surface-container-low px-4 pr-12 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none ${invalidClassName}`}
                />
                <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-on-surface-variant'>
                  {KG_UNIT}
                </span>
              </div>
              <FieldError field='weight' errors={errors} />
            </div>

            <div className='flex h-11 items-center justify-between rounded-lg bg-surface-container px-4'>
              <div className='flex items-center gap-1.5'>
                <span className='text-xs text-on-surface-variant'>{t('customer.patientCreate.section1.bmiLabel')}</span>
                <span className='text-sm font-bold text-primary'>{bmi.value}</span>
              </div>
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${getBmiBadgeClass()}`}>
                {t(`customer.patientCreate.section1.bmiStatus.${bmi.status}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Blood Type */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <span className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.bloodTypeLabel')}
          </span>
          <div className='flex flex-wrap gap-2'>
            {BLOOD_TYPES.map((bt) => {
              const isSelected = formData.bloodType === bt
              return (
                <button
                  key={bt}
                  type='button'
                  onClick={() => onUpdate('bloodType', bt)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {bt === 'UNKNOWN' ? t('customer.patientCreate.section1.bloodTypeUnknown') : bt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
