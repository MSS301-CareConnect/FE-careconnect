import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { PatientDetailData } from '../types'

export interface EmergencyContactsCardProps {
  contacts: PatientDetailData['emergencyContacts']
}

export function EmergencyContactsCard({ contacts }: EmergencyContactsCardProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-on-surface'>
          <Icon name='e911_emergency' className='text-lg text-error' />
          <span>{t('customer.patientDetail.emergencySection.title')}</span>
        </h3>
        <span className='text-[11px] text-on-surface-variant'>
          {t('customer.patientDetail.emergencySection.priorityBadge')}
        </span>
      </div>

      <div className='mt-1 flex flex-col gap-2'>
        {/* Primary Contact */}
        <div className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'>
          <div className='flex flex-col'>
            <span className='text-xs font-semibold text-on-surface'>{contacts.primary.name}</span>
            <span className='text-[11px] text-on-surface-variant'>{contacts.primary.role}</span>
          </div>
          <a
            href={`tel:${contacts.primary.phone}`}
            title={t('customer.patientDetail.emergencySection.callButton')}
            className='rounded-full bg-primary p-2 text-on-primary transition-colors hover:bg-primary-container'
          >
            <Icon name='call' className='text-sm' />
          </a>
        </div>

        {/* Secondary Contact */}
        <div className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'>
          <div className='flex flex-col'>
            <span className='text-xs font-semibold text-on-surface'>{contacts.secondary.name}</span>
            <span className='text-[11px] text-on-surface-variant'>{contacts.secondary.role}</span>
          </div>
          <a
            href={`tel:${contacts.secondary.phone}`}
            title={t('customer.patientDetail.emergencySection.callButton')}
            className='rounded-full bg-surface-container p-2 text-primary transition-colors hover:bg-surface-container-high'
          >
            <Icon name='call' className='text-sm' />
          </a>
        </div>

        {/* Hotline Box */}
        <div className='flex items-center justify-between rounded-lg bg-error-container/40 p-3 text-on-error-container'>
          <div className='flex items-center gap-2'>
            <Icon name='medical_services' className='text-xl text-error' />
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-error'>
                {t('customer.patientDetail.emergencySection.hotlineTitle')}
              </span>
              <span className='text-[11px] text-on-error-container'>
                {t('customer.patientDetail.emergencySection.hotlineDesc')}
              </span>
            </div>
          </div>
          <span className='text-sm font-bold text-error'>{contacts.hotline}</span>
        </div>
      </div>
    </div>
  )
}
