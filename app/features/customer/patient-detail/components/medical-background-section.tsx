import { useTranslation } from 'react-i18next'

import { formatRecipientDate } from '~/entities/care-recipient/care-recipient-format'
import type { CareRecipientRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ProfileDraft } from '../profile-draft'
import { inputClassName } from './form-field'

const FIELDS = [
  { field: 'chronicConditions', label: 'chronicLabel', dot: 'bg-primary', box: 'bg-surface-container-low' },
  { field: 'allergies', label: 'allergyLabel', dot: 'bg-error', box: 'bg-error-container/20' },
  { field: 'medicalHistory', label: 'historyLabel', dot: 'bg-surface-tint', box: 'bg-surface-container-low' }
] as const

export interface MedicalBackgroundSectionProps {
  profile: CareRecipientRecord
  draft: ProfileDraft
  isEditMode: boolean
  onUpdate: (partial: Partial<ProfileDraft>) => void
}

export function MedicalBackgroundSection({ profile, draft, isEditMode, onUpdate }: MedicalBackgroundSectionProps) {
  const { t, i18n } = useTranslation()
  const updatedAt = formatRecipientDate(profile.updatedAt, i18n.language)

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Icon name='vital_signs' className='text-2xl text-primary' />
          <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.medicalBackground.title')}</h2>
        </div>
        {updatedAt ? (
          <span className='text-xs text-on-surface-variant'>
            {t('customer.patientDetail.medicalBackground.lastUpdated', { date: updatedAt })}
          </span>
        ) : null}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {FIELDS.map(({ field, label, dot, box }) => (
          <div key={field} className={`flex flex-col gap-1.5 ${field === 'chronicConditions' ? 'md:col-span-2' : ''}`}>
            <label className='flex flex-col gap-1.5'>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span>{t(`customer.patientDetail.medicalBackground.${label}`)}</span>
              </span>
              {isEditMode ? (
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={draft[field]}
                  onChange={(e) => onUpdate({ [field]: e.target.value })}
                  className={inputClassName}
                />
              ) : null}
            </label>
            {!isEditMode ? (
              <p className={`rounded-lg p-3 text-xs whitespace-pre-line text-on-surface ${box}`}>
                {profile[field] || t('customer.careRecipient.notProvided')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
