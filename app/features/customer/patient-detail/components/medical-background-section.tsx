import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientDetailData } from '../types'

export interface MedicalBackgroundSectionProps {
  medicalBackground: PatientDetailData['medicalBackground']
  isEditMode: boolean
  onUpdate: (partial: Partial<PatientDetailData['medicalBackground']>) => void
}

export function MedicalBackgroundSection({ medicalBackground, isEditMode, onUpdate }: MedicalBackgroundSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon name='vital_signs' className='text-2xl text-primary' />
          <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.medicalBackground.title')}</h2>
        </div>
        <span className='text-xs text-on-surface-variant'>
          {t('customer.patientDetail.medicalBackground.lastUpdated')}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Chronic Illnesses */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
            <span className='h-2 w-2 rounded-full bg-primary' />
            <span>{t('customer.patientDetail.medicalBackground.chronicLabel')}</span>
          </label>
          {!isEditMode ? (
            <div className='flex flex-wrap gap-2 pt-1'>
              {medicalBackground.chronicIllnesses.map((item, idx) => (
                <span
                  key={idx}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    idx === medicalBackground.chronicIllnesses.length - 1
                      ? 'bg-error-container/60 font-semibold text-error'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <textarea
              rows={2}
              value={medicalBackground.chronicIllnessesText}
              onChange={(e) => onUpdate({ chronicIllnessesText: e.target.value })}
              className='w-full rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
            />
          )}
        </div>

        {/* Allergy Information */}
        <div className='flex flex-col gap-1.5'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
            <span className='h-2 w-2 rounded-full bg-error' />
            <span>{t('customer.patientDetail.medicalBackground.allergyLabel')}</span>
          </label>
          {!isEditMode ? (
            <div className='rounded-lg bg-error-container/20 p-3 text-xs text-on-surface'>
              {medicalBackground.allergyText}
            </div>
          ) : (
            <input
              type='text'
              value={medicalBackground.allergyText}
              onChange={(e) => onUpdate({ allergyText: e.target.value })}
              className='w-full rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
            />
          )}
        </div>

        {/* Surgical History */}
        <div className='flex flex-col gap-1.5'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
            <span className='h-2 w-2 rounded-full bg-surface-tint' />
            <span>{t('customer.patientDetail.medicalBackground.surgeryLabel')}</span>
          </label>
          {!isEditMode ? (
            <div className='rounded-lg bg-surface-container-low p-3 text-xs text-on-surface'>
              {medicalBackground.surgeryText}
            </div>
          ) : (
            <input
              type='text'
              value={medicalBackground.surgeryText}
              onChange={(e) => onUpdate({ surgeryText: e.target.value })}
              className='w-full rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
            />
          )}
        </div>

        {/* Attending Doctor */}
        <div className='flex flex-col gap-1.5 md:col-span-2'>
          <label className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
            <span className='h-2 w-2 rounded-full bg-tertiary' />
            <span>{t('customer.patientDetail.medicalBackground.attendingDoctorLabel')}</span>
          </label>
          <div className='flex items-center justify-between rounded-lg bg-surface-container-low p-3 text-xs'>
            <div className='flex items-center gap-3'>
              <Icon name='stethoscope' className='text-2xl text-primary' />
              <div>
                <p className='font-semibold text-on-surface'>
                  {medicalBackground.attendingDoctor.name} • {medicalBackground.attendingDoctor.department}
                </p>
                <p className='text-xs text-on-surface-variant'>{medicalBackground.attendingDoctor.hospital}</p>
              </div>
            </div>
            <a
              href={`tel:${medicalBackground.attendingDoctor.phone}`}
              className='text-xs font-semibold text-primary hover:underline'
            >
              {t('customer.patientDetail.medicalBackground.callDoctor', {
                phone: medicalBackground.attendingDoctor.phone
              })}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
