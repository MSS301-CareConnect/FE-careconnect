import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function CustomerFooter() {
  const { t } = useTranslation()

  return (
    <footer className='mt-auto w-full bg-surface-container-lowest py-8 shadow-[0_-1px_6px_rgba(0,0,0,0.03)]'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:text-left'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary'>
            <Icon name='health_and_safety' className='text-lg' />
          </div>
          <span className='text-base font-bold text-primary'>{t('common.brand')}</span>
        </div>

        <p className='text-xs text-on-surface-variant'>{t('customer.footer.tagline')}</p>

        <div className='flex items-center gap-6'>
          <Link to='/privacy-policy' className='text-xs text-on-surface-variant transition-colors hover:text-primary'>
            {t('customer.footer.privacy')}
          </Link>
          <Link to='/terms-of-service' className='text-xs text-on-surface-variant transition-colors hover:text-primary'>
            {t('customer.footer.terms')}
          </Link>
          <Link to='/support' className='text-xs text-on-surface-variant transition-colors hover:text-primary'>
            {t('customer.footer.support')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
