import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function ProfileBreadcrumb() {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col'>
      <nav
        aria-label={t('customer.profile.breadcrumb.personalInfo')}
        className='mb-4 flex items-center gap-1.5 text-on-surface-variant'
      >
        <Link to='/' className='flex items-center gap-1 text-xs transition-colors hover:text-primary'>
          <Icon name='home' className='text-sm' />
          <span>{t('customer.profile.breadcrumb.home')}</span>
        </Link>
        <Icon name='chevron_right' className='text-xs text-outline-variant' />
        <span className='text-xs text-on-surface-variant'>{t('customer.profile.breadcrumb.myAccount')}</span>
        <Icon name='chevron_right' className='text-xs text-outline-variant' />
        <span className='text-xs font-semibold text-primary'>{t('customer.profile.breadcrumb.personalInfo')}</span>
      </nav>

      <div className='mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <span className='rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-semibold tracking-wide text-on-secondary-container uppercase'>
              {t('customer.profile.badge.verifiedAccount')}
            </span>
            <span className='flex items-center gap-1.5 text-xs text-on-surface-variant'>
              <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-primary' />
              {t('customer.profile.badge.online')}
            </span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight text-on-surface'>{t('customer.profile.header.title')}</h1>
          <p className='mt-1 max-w-2xl text-sm text-on-surface-variant'>{t('customer.profile.header.subtitle')}</p>
        </div>
      </div>
    </div>
  )
}
