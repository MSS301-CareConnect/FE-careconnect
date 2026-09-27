import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientDetailData } from '../types'

export interface PatientSnapshotCardProps {
  data: PatientDetailData
  isEditMode: boolean
  onUpdate: (partial: Partial<PatientDetailData>) => void
}

export function PatientSnapshotCard({ data, isEditMode }: PatientSnapshotCardProps) {
  const { t } = useTranslation()

  return (
    <div className='relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm'>
      <div className='absolute top-0 right-0 left-0 h-20 bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container' />

      {/* Patient Portrait with verified or camera trigger */}
      <div className='relative z-10 mt-4 mb-3'>
        <img
          src={data.avatar}
          alt={data.name}
          className='h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-surface-container-lowest'
        />
        {isEditMode ? (
          <button
            type='button'
            title={t('customer.patientDetail.snapshot.changeAvatar')}
            className='absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-colors hover:bg-primary-container'
          >
            <Icon name='photo_camera' className='text-base' />
          </button>
        ) : (
          <span
            title={t('customer.patientDetail.snapshot.verifiedRecord')}
            className='absolute right-1 bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary ring-2 ring-surface-container-lowest'
          >
            <Icon name='verified' className='text-xs' />
          </span>
        )}
      </div>

      <h2 className='text-lg font-bold text-on-surface'>{data.name}</h2>
      <p className='mt-0.5 text-xs text-on-surface-variant'>
        <span>{data.relationshipLabel}</span> • <span>{data.age}</span> •{' '}
        <span>
          {data.gender === 'male'
            ? t('customer.patientProfiles.card.genderMale')
            : t('customer.patientProfiles.card.genderFemale')}
        </span>
      </p>

      {/* Quick Physical Matrix Chips */}
      <div className='mt-4 grid w-full grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-3 text-left'>
        <div className='flex flex-col'>
          <span className='text-[11px] text-on-surface-variant'>{t('customer.patientDetail.snapshot.bloodType')}</span>
          <span className='text-sm font-bold text-primary'>{data.bloodType}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[11px] text-on-surface-variant'>{t('customer.patientDetail.snapshot.height')}</span>
          <span className='text-sm font-semibold text-on-surface'>{data.height}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[11px] text-on-surface-variant'>{t('customer.patientDetail.snapshot.weight')}</span>
          <span className='text-sm font-semibold text-on-surface'>{data.weight}</span>
        </div>
      </div>

      {/* Identity & Health Insurance Numbers */}
      <div className='mt-4 flex w-full flex-col gap-2.5 border-t border-surface-container pt-4 text-left text-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.nationalIdLabel')}</span>
          <span className='font-mono font-semibold text-on-surface'>{data.nationalId}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.insuranceIdLabel')}</span>
          <span className='font-mono font-semibold text-primary'>{data.insuranceId}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-on-surface-variant'>{t('customer.patientDetail.snapshot.dobLabel')}</span>
          <span className='font-medium text-on-surface'>{data.dob}</span>
        </div>
      </div>

      {/* Urgent Notice Box */}
      <div className='mt-4 flex w-full items-start gap-2 rounded-lg bg-secondary-container/20 p-3 text-left text-on-secondary-container'>
        <Icon name='health_and_safety' className='mt-0.5 shrink-0 text-base text-primary' />
        <p className='text-[11px] leading-relaxed'>{t('customer.patientDetail.snapshot.verifiedNotice')}</p>
      </div>
    </div>
  )
}
