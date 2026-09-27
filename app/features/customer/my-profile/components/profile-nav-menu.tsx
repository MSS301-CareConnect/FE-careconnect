import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function ProfileNavMenu() {
  const { t } = useTranslation()
  const familyCount = 3

  return (
    <div className='rounded-2xl bg-surface-container-lowest p-2 shadow-sm'>
      <div className='px-4 py-2 text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase'>
        {t('customer.profile.nav.title')}
      </div>

      <nav className='mt-1 flex flex-col gap-1'>
        <a
          href='#personal-info'
          className='flex items-center justify-between rounded-xl bg-secondary-container/40 px-4 py-2.5 font-semibold text-primary transition-all'
        >
          <div className='flex items-center gap-3'>
            <Icon name='person' filled className='text-xl text-primary' />
            <span className='text-sm'>{t('customer.profile.nav.personalInfo')}</span>
          </div>
          <span className='h-5 w-1.5 rounded-full bg-primary' />
        </a>

        <a
          href='#security-section'
          className='flex items-center justify-between rounded-xl px-4 py-2.5 text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface'
        >
          <div className='flex items-center gap-3'>
            <Icon name='lock_reset' className='text-xl' />
            <span className='text-sm'>{t('customer.profile.nav.security')}</span>
          </div>
          <Icon name='chevron_right' className='text-lg text-outline-variant' />
        </a>

        <Link
          to='/customer/patient-profiles'
          className='flex items-center justify-between rounded-xl px-4 py-2.5 text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface'
        >
          <div className='flex items-center gap-3'>
            <Icon name='family_restroom' className='text-xl' />
            <span className='text-sm'>{t('customer.profile.nav.familyProfiles')}</span>
          </div>
          <span className='rounded-full bg-surface-container px-2 py-0.5 text-xs font-bold text-primary'>
            {familyCount}
          </span>
        </Link>

        <Link
          to='/customer/bookings'
          className='flex items-center justify-between rounded-xl px-4 py-2.5 text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface'
        >
          <div className='flex items-center gap-3'>
            <Icon name='calendar_month' className='text-xl' />
            <span className='text-sm'>{t('customer.profile.nav.bookingHistory')}</span>
          </div>
          <Icon name='chevron_right' className='text-lg text-outline-variant' />
        </Link>

        <Link
          to='/customer/notifications'
          className='flex items-center justify-between rounded-xl px-4 py-2.5 text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface'
        >
          <div className='flex items-center gap-3'>
            <Icon name='notifications_active' className='text-xl' />
            <span className='text-sm'>{t('customer.profile.nav.notifications')}</span>
          </div>
          <span className='h-2 w-2 rounded-full bg-error' />
        </Link>
      </nav>
    </div>
  )
}
