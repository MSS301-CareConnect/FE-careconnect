import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { BloodType, BmiResult, Gender, PatientCreateFormData, Relationship } from '../types'

export interface BasicInfoSectionProps {
  formData: PatientCreateFormData
  bmi: BmiResult
  onUpdate: <K extends keyof PatientCreateFormData>(field: K, value: PatientCreateFormData[K]) => void
}

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'unknown']
const STEP_1 = '1'
const CM_UNIT = 'cm'
const KG_UNIT = 'kg'

export function BasicInfoSection({ formData, bmi, onUpdate }: BasicInfoSectionProps) {
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
            value={formData.fullName}
            onChange={(e) => onUpdate('fullName', e.target.value)}
            placeholder={t('customer.patientCreate.section1.fullNamePlaceholder')}
            className='h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
          />
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
              className='h-11 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low px-4 pr-10 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
            >
              <option value='father'>{t('customer.patientCreate.section1.relationshipOptions.father')}</option>
              <option value='mother'>{t('customer.patientCreate.section1.relationshipOptions.mother')}</option>
              <option value='spouse'>{t('customer.patientCreate.section1.relationshipOptions.spouse')}</option>
              <option value='child'>{t('customer.patientCreate.section1.relationshipOptions.child')}</option>
              <option value='grandparent'>
                {t('customer.patientCreate.section1.relationshipOptions.grandparent')}
              </option>
              <option value='sibling'>{t('customer.patientCreate.section1.relationshipOptions.sibling')}</option>
              <option value='other'>{t('customer.patientCreate.section1.relationshipOptions.other')}</option>
            </select>
            <Icon
              name='expand_more'
              className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant'
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='birthDateInput' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.birthDateLabel')} <span className='text-error'>*</span>
          </label>
          <input
            id='birthDateInput'
            type='date'
            value={formData.birthDate}
            onChange={(e) => onUpdate('birthDate', e.target.value)}
            className='h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
          />
        </div>

        {/* Gender */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <span className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.genderLabel')} <span className='text-error'>*</span>
          </span>
          <div className='flex flex-wrap gap-3'>
            {(['male', 'female', 'other'] as Gender[]).map((genderVal) => (
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
                <span>{t(`customer.patientCreate.section1.genderOptions.${genderVal}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* National ID */}
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center justify-between'>
            <label htmlFor='idNumberInput' className='text-xs font-semibold text-on-surface'>
              {t('customer.patientCreate.section1.idNumberLabel')}
            </label>
            <button
              type='button'
              className='inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline'
            >
              <Icon name='sync' className='text-xs' />
              <span>{t('customer.patientCreate.section1.syncVNeID')}</span>
            </button>
          </div>
          <input
            id='idNumberInput'
            type='text'
            value={formData.idNumber}
            onChange={(e) => onUpdate('idNumber', e.target.value)}
            placeholder={t('customer.patientCreate.section1.idNumberPlaceholder')}
            className='h-11 rounded-lg bg-surface-container-low px-4 text-xs text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
          />
        </div>

        {/* Health Insurance Number */}
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='bhytNumberInput' className='text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.section1.bhytNumberLabel')}
          </label>
          <input
            id='bhytNumberInput'
            type='text'
            value={formData.bhytNumber}
            onChange={(e) => onUpdate('bhytNumber', e.target.value)}
            placeholder={t('customer.patientCreate.section1.bhytNumberPlaceholder')}
            className='h-11 rounded-lg bg-surface-container-low px-4 text-xs tracking-wider text-on-surface uppercase placeholder:text-on-surface-variant/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
          />
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
                  min='50'
                  max='250'
                  value={formData.height}
                  onChange={(e) => onUpdate('height', e.target.value === '' ? '' : Number(e.target.value))}
                  className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-12 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
                />
                <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-on-surface-variant'>
                  {CM_UNIT}
                </span>
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='weightInput' className='text-xs font-semibold text-on-surface'>
                {t('customer.patientCreate.section1.weightLabel')}
              </label>
              <div className='relative'>
                <input
                  id='weightInput'
                  type='number'
                  min='20'
                  max='200'
                  value={formData.weight}
                  onChange={(e) => onUpdate('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-12 text-xs text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none'
                />
                <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-on-surface-variant'>
                  {KG_UNIT}
                </span>
              </div>
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
                  {bt === 'unknown' ? t('customer.patientCreate.section1.bloodTypeUnknown') : bt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
