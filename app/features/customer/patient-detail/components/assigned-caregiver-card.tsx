import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import type { PatientDetailData } from '../types'

export interface AssignedCaregiverCardProps {
  caregiver: PatientDetailData['caregiver']
}

export function AssignedCaregiverCard({ caregiver }: AssignedCaregiverCardProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-semibold text-on-surface'>
          {t('customer.patientDetail.caregiverWidget.title')}
        </span>
        <span className='rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-primary'>
          {t('customer.patientDetail.caregiverWidget.shiftBadge')}
        </span>
      </div>

      <div className='flex items-center gap-3 rounded-lg bg-surface-container-low p-3'>
        <img
          src={caregiver.avatar}
          alt={caregiver.name}
          className='h-12 w-12 rounded-full object-cover ring-2 ring-primary/20'
        />
        <div className='flex flex-col'>
          <span className='text-xs font-semibold text-on-surface'>{caregiver.name}</span>
          <span className='text-[11px] text-on-surface-variant'>{caregiver.title}</span>
          <div className='mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary'>
            <Icon name='star' filled className='text-xs text-amber-500' />
            <span>
              {t('customer.patientDetail.caregiverWidget.ratingCount', {
                rating: caregiver.rating,
                count: caregiver.reviewCount
              })}
            </span>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between pt-1 text-xs'>
        <span className='text-on-surface-variant'>{t('customer.patientDetail.caregiverWidget.shiftTimeLabel')}</span>
        <span className='font-semibold text-on-surface'>{caregiver.shiftTime}</span>
      </div>

      <Link
        to='/customer/messages'
        className='mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container py-2 text-xs font-semibold text-on-secondary-container transition-colors hover:bg-surface-container-high'
      >
        <Icon name='chat' className='text-base' />
        <span>{t('customer.patientDetail.caregiverWidget.chatButton')}</span>
      </Link>
    </div>
  )
}
