import { useTranslation } from 'react-i18next'

import { ageFromBirthDate, formatRecipientDate } from '~/entities/care-recipient/care-recipient-format'
import {
  CareRecipientUpdateRequestBloodType,
  CareRecipientUpdateRequestGender,
  type CareRecipientRecord
} from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ProfileDraft } from '../profile-draft'
import { FormField, inputClassName } from './form-field'

export interface PatientSnapshotCardProps {
  profile: CareRecipientRecord
  draft: ProfileDraft
  isEditMode: boolean
  onUpdate: (partial: Partial<ProfileDraft>) => void
}

export function PatientSnapshotCard({ profile, draft, isEditMode, onUpdate }: PatientSnapshotCardProps) {
  const { t, i18n } = useTranslation()
  const notProvided = t('customer.careRecipient.notProvided')
  const age = ageFromBirthDate(profile.dateOfBirth)
  const bloodType = profile.bloodType === 'UNKNOWN' ? t('customer.careRecipient.bloodType.UNKNOWN') : profile.bloodType
  const summary = [
    age === undefined ? undefined : t('customer.careRecipient.yearsOld', { age }),
    profile.gender ? t(`customer.careRecipient.gender.${profile.gender}`) : undefined
  ].filter(Boolean)

  return (
    <div className='relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm'>
      <div className='absolute top-0 right-0 left-0 h-20 bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container' />

      {/* Patient Portrait */}
      <div className='relative z-10 mt-4 mb-3'>
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={t('customer.patientDetail.snapshot.avatarAlt', { name: profile.fullName })}
            className='h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-surface-container-lowest'
          />
        ) : (
          <span className='flex h-28 w-28 items-center justify-center rounded-full bg-secondary-container text-primary shadow-md ring-4 ring-surface-container-lowest'>
            <Icon name='person' className='text-6xl' />
          </span>
        )}
      </div>

      {!isEditMode ? (
        <>
          <h2 className='text-lg font-bold text-on-surface'>{profile.fullName}</h2>
          {summary.length > 0 ? <p className='mt-0.5 text-xs text-on-surface-variant'>{summary.join(' • ')}</p> : null}

          {/* Quick Physical Matrix Chips */}
          <div className='mt-4 grid w-full grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-3 text-left'>
            <div className='flex flex-col'>
              <span className='text-[11px] text-on-surface-variant'>
                {t('customer.patientDetail.snapshot.bloodType')}
              </span>
              <span className='text-sm font-bold text-primary'>{bloodType ?? '-'}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[11px] text-on-surface-variant'>{t('customer.patientDetail.snapshot.height')}</span>
              <span className='text-sm font-semibold text-on-surface'>
                {profile.heightCm === undefined
                  ? '-'
                  : t('customer.patientDetail.snapshot.heightValue', { value: profile.heightCm })}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[11px] text-on-surface-variant'>{t('customer.patientDetail.snapshot.weight')}</span>
              <span className='text-sm font-semibold text-on-surface'>
                {profile.weightKg === undefined
                  ? '-'
                  : t('customer.patientDetail.snapshot.weightValue', { value: profile.weightKg })}
              </span>
            </div>
          </div>

          {/* Personal Details */}
          <div className='mt-4 flex w-full flex-col gap-2.5 border-t border-surface-container pt-4 text-left text-xs'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.dobLabel')}</span>
              <span className='font-medium text-on-surface'>
                {formatRecipientDate(profile.dateOfBirth, i18n.language) ?? notProvided}
              </span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.phoneLabel')}</span>
              <span className='font-mono font-semibold text-on-surface'>{profile.phoneNumber ?? notProvided}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.updatedLabel')}</span>
              <span className='font-medium text-on-surface'>
                {formatRecipientDate(profile.updatedAt, i18n.language) ?? notProvided}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className='mt-2 grid w-full grid-cols-2 gap-3'>
          <FormField label={t('customer.patientDetail.snapshot.fullNameLabel')} className='col-span-2'>
            <input
              type='text'
              required
              maxLength={255}
              value={draft.fullName}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              className={inputClassName}
            />
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.genderLabel')}>
            <select
              value={draft.gender}
              onChange={(e) => onUpdate({ gender: e.target.value as ProfileDraft['gender'] })}
              className={inputClassName}
            >
              <option value=''>{t('customer.patientDetail.snapshot.selectPlaceholder')}</option>
              {Object.values(CareRecipientUpdateRequestGender).map((gender) => (
                <option key={gender} value={gender}>
                  {t(`customer.careRecipient.gender.${gender}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.dateOfBirthLabel')}>
            <input
              type='date'
              value={draft.dateOfBirth}
              onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
              className={inputClassName}
            />
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.phoneNumberLabel')} className='col-span-2'>
            <input
              type='tel'
              inputMode='numeric'
              value={draft.phoneNumber}
              onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
              className={inputClassName}
            />
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.bloodTypeLabel')} className='col-span-2'>
            <select
              value={draft.bloodType}
              onChange={(e) => onUpdate({ bloodType: e.target.value as ProfileDraft['bloodType'] })}
              className={inputClassName}
            >
              <option value=''>{t('customer.patientDetail.snapshot.selectPlaceholder')}</option>
              {Object.values(CareRecipientUpdateRequestBloodType).map((type) => (
                <option key={type} value={type}>
                  {type === 'UNKNOWN' ? t('customer.careRecipient.bloodType.UNKNOWN') : type}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.heightLabel')}>
            <input
              type='number'
              min={0}
              max={300}
              step='0.1'
              value={draft.heightCm}
              onChange={(e) => onUpdate({ heightCm: e.target.value })}
              className={inputClassName}
            />
          </FormField>
          <FormField label={t('customer.patientDetail.snapshot.weightLabel')}>
            <input
              type='number'
              min={0}
              max={500}
              step='0.1'
              value={draft.weightKg}
              onChange={(e) => onUpdate({ weightKg: e.target.value })}
              className={inputClassName}
            />
          </FormField>
        </div>
      )}
    </div>
  )
}
