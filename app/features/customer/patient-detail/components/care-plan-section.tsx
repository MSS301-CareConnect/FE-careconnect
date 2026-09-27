import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientDetailData } from '../types'

export interface CarePlanSectionProps {
  carePlan: PatientDetailData['carePlan']
  isEditMode: boolean
  onUpdate: (partial: Partial<PatientDetailData['carePlan']>) => void
}

export function CarePlanSection({ carePlan, isEditMode, onUpdate }: CarePlanSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon name='assignment_turned_in' className='text-2xl text-primary' />
          <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.carePlan.title')}</h2>
        </div>
        <span className='text-xs font-semibold text-primary'>{t('customer.patientDetail.carePlan.standardBadge')}</span>
      </div>

      {/* Bento Grid Care Instructions */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {/* Mobility */}
        <div className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
            <Icon name='assist_walker' className='text-xl' />
          </div>
          <span className='text-xs font-semibold text-on-surface'>
            {t('customer.patientDetail.carePlan.mobilityTitle')}
          </span>
          <p className='text-xs text-on-surface-variant leading-relaxed'>{carePlan.mobility}</p>
        </div>

        {/* Nutrition */}
        <div className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
            <Icon name='nutrition' className='text-xl' />
          </div>
          <span className='text-xs font-semibold text-on-surface'>
            {t('customer.patientDetail.carePlan.nutritionTitle')}
          </span>
          <p className='text-xs text-on-surface-variant leading-relaxed'>{carePlan.nutrition}</p>
        </div>

        {/* Vitals */}
        <div className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary'>
            <Icon name='monitor_heart' className='text-xl' />
          </div>
          <span className='text-xs font-semibold text-on-surface'>
            {t('customer.patientDetail.carePlan.vitalsTitle')}
          </span>
          <p className='text-xs text-on-surface-variant leading-relaxed'>{carePlan.vitals}</p>
        </div>
      </div>

      {/* Living Address */}
      <div className='flex flex-col gap-1.5 rounded-xl bg-surface-container-low p-4'>
        <span className='flex items-center gap-1 text-xs font-semibold text-on-surface'>
          <Icon name='home_pin' className='text-lg text-primary' />
          <span>{t('customer.patientDetail.carePlan.addressLabel')}</span>
        </span>
        {!isEditMode ? (
          <p className='text-xs text-on-surface'>{carePlan.address}</p>
        ) : (
          <input
            type='text'
            value={carePlan.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            className='w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none'
          />
        )}
      </div>
    </div>
  )
}
