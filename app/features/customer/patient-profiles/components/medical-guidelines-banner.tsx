import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function MedicalGuidelinesBanner() {
  const { t } = useTranslation()

  return (
    <div className='relative flex flex-col items-start gap-4 overflow-hidden rounded-xl bg-surface-container-low p-6 md:flex-row'>
      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm'>
        <Icon name='verified_user' className='text-2xl' />
      </div>

      <div className='flex-1'>
        <h4 className='mb-1 text-sm font-bold text-on-surface'>{t('customer.patientProfiles.guidelines.title')}</h4>
        <p className='mb-3 text-xs text-on-surface-variant leading-relaxed'>
          {t('customer.patientProfiles.guidelines.description')}
        </p>

        <div className='flex flex-wrap items-center gap-4 text-xs font-semibold text-primary'>
          <span className='flex items-center gap-1'>
            <Icon name='lock' className='text-base' />
            <span>{t('customer.patientProfiles.guidelines.badgeHipaa')}</span>
          </span>
          <span className='flex items-center gap-1'>
            <Icon name='security' className='text-base' />
            <span>{t('customer.patientProfiles.guidelines.badgePrivacy')}</span>
          </span>
          <span className='flex items-center gap-1'>
            <Icon name='sync' className='text-base' />
            <span>{t('customer.patientProfiles.guidelines.badgeSync')}</span>
          </span>
        </div>
      </div>

      <button
        type='button'
        className='shrink-0 self-start rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container md:self-center'
      >
        {t('customer.patientProfiles.guidelines.viewDoc')}
      </button>
    </div>
  )
}
