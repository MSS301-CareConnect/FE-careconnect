import { useTranslation } from 'react-i18next'

import {
  CareRecipientUpdateRequestIndependenceLevel,
  CareRecipientUpdateRequestMobilityLevel,
  type CareRecipientRecord
} from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ProfileDraft } from '../profile-draft'
import { FormField, inputClassName } from './form-field'

const NOTES = [
  { field: 'dietaryNotes', title: 'nutritionTitle', icon: 'nutrition' },
  { field: 'sleepHabits', title: 'sleepTitle', icon: 'bedtime' },
  { field: 'behaviorNotes', title: 'behaviorTitle', icon: 'psychology' },
  { field: 'careRequirements', title: 'requirementsTitle', icon: 'assignment' }
] as const

const ADDRESS = [
  { field: 'addressLine', label: 'addressLineLabel', maxLength: 500 },
  { field: 'ward', label: 'wardLabel', maxLength: 255 },
  { field: 'district', label: 'districtLabel', maxLength: 255 },
  { field: 'province', label: 'provinceLabel', maxLength: 255 }
] as const

export interface CarePlanSectionProps {
  profile: CareRecipientRecord
  draft: ProfileDraft
  isEditMode: boolean
  onUpdate: (partial: Partial<ProfileDraft>) => void
}

export function CarePlanSection({ profile, draft, isEditMode, onUpdate }: CarePlanSectionProps) {
  const { t } = useTranslation()
  const notProvided = t('customer.careRecipient.notProvided')
  const address = [profile.addressLine, profile.ward, profile.district, profile.province].filter(Boolean).join(', ')

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center gap-2'>
        <Icon name='assignment_turned_in' className='text-2xl text-primary' />
        <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.carePlan.title')}</h2>
      </div>

      {/* Bento Grid Care Instructions */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Mobility & Independence */}
        <div className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4 md:col-span-2'>
          <div className='flex items-center gap-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
              <Icon name='assist_walker' className='text-xl' />
            </span>
            <span className='text-xs font-semibold text-on-surface'>
              {t('customer.patientDetail.carePlan.mobilityTitle')}
            </span>
          </div>
          {isEditMode ? (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <FormField label={t('customer.patientDetail.carePlan.mobilityLabel')}>
                <select
                  value={draft.mobilityLevel}
                  onChange={(e) => onUpdate({ mobilityLevel: e.target.value as ProfileDraft['mobilityLevel'] })}
                  className={inputClassName}
                >
                  <option value=''>{t('customer.patientDetail.carePlan.selectPlaceholder')}</option>
                  {Object.values(CareRecipientUpdateRequestMobilityLevel).map((level) => (
                    <option key={level} value={level}>
                      {t(`customer.careRecipient.mobility.${level}`)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t('customer.patientDetail.carePlan.independenceLabel')}>
                <select
                  value={draft.independenceLevel}
                  onChange={(e) => onUpdate({ independenceLevel: e.target.value as ProfileDraft['independenceLevel'] })}
                  className={inputClassName}
                >
                  <option value=''>{t('customer.patientDetail.carePlan.selectPlaceholder')}</option>
                  {Object.values(CareRecipientUpdateRequestIndependenceLevel).map((level) => (
                    <option key={level} value={level}>
                      {t(`customer.careRecipient.independence.${level}`)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-1 text-xs sm:grid-cols-2'>
              <p className='text-on-surface-variant'>
                {t('customer.patientDetail.carePlan.mobilityLabel')}:{' '}
                <strong className='font-semibold text-on-surface'>
                  {profile.mobilityLevel ? t(`customer.careRecipient.mobility.${profile.mobilityLevel}`) : notProvided}
                </strong>
              </p>
              <p className='text-on-surface-variant'>
                {t('customer.patientDetail.carePlan.independenceLabel')}:{' '}
                <strong className='font-semibold text-on-surface'>
                  {profile.independenceLevel
                    ? t(`customer.careRecipient.independence.${profile.independenceLevel}`)
                    : notProvided}
                </strong>
              </p>
            </div>
          )}
        </div>

        {NOTES.map(({ field, title, icon }) => (
          <label key={field} className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4'>
            <span className='flex items-center gap-2'>
              <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
                <Icon name={icon} className='text-xl' />
              </span>
              <span className='text-xs font-semibold text-on-surface'>
                {t(`customer.patientDetail.carePlan.${title}`)}
              </span>
            </span>
            {isEditMode ? (
              <textarea
                rows={3}
                maxLength={5000}
                value={draft[field]}
                onChange={(e) => onUpdate({ [field]: e.target.value })}
                className='w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
              />
            ) : (
              <span className='text-xs whitespace-pre-line text-on-surface-variant leading-relaxed'>
                {profile[field] || notProvided}
              </span>
            )}
          </label>
        ))}
      </div>

      {/* Living Address */}
      <div className='flex flex-col gap-1.5 rounded-xl bg-surface-container-low p-4'>
        <span className='flex items-center gap-1 text-xs font-semibold text-on-surface'>
          <Icon name='home_pin' className='text-lg text-primary' />
          <span>{t('customer.patientDetail.carePlan.addressLabel')}</span>
        </span>
        {!isEditMode ? (
          <p className='text-xs text-on-surface'>{address || notProvided}</p>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {ADDRESS.map(({ field, label, maxLength }) => (
              <FormField key={field} label={t(`customer.patientDetail.carePlan.${label}`)}>
                <input
                  type='text'
                  maxLength={maxLength}
                  value={draft[field]}
                  onChange={(e) => onUpdate({ [field]: e.target.value })}
                  className='w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
                />
              </FormField>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
