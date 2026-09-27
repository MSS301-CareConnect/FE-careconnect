import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function PatientBreadcrumb() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('customer.patientProfiles.breadcrumb.title')}
      className='mb-6 flex items-center gap-1.5 text-xs text-on-surface-variant'
    >
      <Link to='/' className='flex items-center gap-1 transition-colors hover:text-primary'>
        <Icon name='home' className='text-sm' />
        <span>{t('customer.patientProfiles.breadcrumb.home')}</span>
      </Link>
      <Icon name='chevron_right' className='text-xs text-outline-variant' />
      <Link to='/customer/my-profile' className='transition-colors hover:text-primary'>
        {t('customer.patientProfiles.breadcrumb.myAccount')}
      </Link>
      <Icon name='chevron_right' className='text-xs text-outline-variant' />
      <span className='font-semibold text-on-surface'>{t('customer.patientProfiles.breadcrumb.title')}</span>
    </nav>
  )
}
