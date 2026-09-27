import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const HOTLINE_NUMBER = '1900 6868'

export function EmergencySupportCard() {
  const { t } = useTranslation()

  return (
    <div className='flex items-center gap-4 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container p-6 shadow-sm'>
      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm'>
        <Icon name='support_agent' className='text-2xl' />
      </div>
      <div className='flex flex-col'>
        <span className='text-sm font-bold text-on-surface'>{t('customer.profile.support.title')}</span>
        <span className='text-xs text-on-surface-variant'>
          {t('customer.profile.support.hotlineLabel')}{' '}
          <strong className='font-bold text-on-surface'>{HOTLINE_NUMBER}</strong>
        </span>
      </div>
    </div>
  )
}
