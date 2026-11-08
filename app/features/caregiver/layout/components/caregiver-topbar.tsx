import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { activeCaregiverNavigation } from '../caregiver-navigation.constants'
import { CaregiverAccountMenu } from './caregiver-account-menu'
import { CaregiverNotificationBell } from './caregiver-notification-bell'

/**
 * Compact topbar. Phones show the brand mark and the section name (the page's H1 repeats it in larger type below);
 * desktop leaves the title to the page and keeps only the bell and the account menu. No backdrop blur: it would
 * become the containing block of the bell's fixed bottom sheet on phones.
 */
export function CaregiverTopbar({ avatarUrl, name }: { avatarUrl?: string; name?: string }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest print:hidden'>
      <div className='flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:h-16'>
        <Link
          aria-label={t('common.brand')}
          className='flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-primary lg:hidden'
          to='/caregiver/today'
        >
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-on-primary'>
            <Icon className='text-lg' name='volunteer_activism' />
          </span>
          <span className='truncate text-base font-semibold text-on-surface'>{t(`caregiver.nav.${active.key}`)}</span>
        </Link>
        <span className='hidden lg:block' />
        <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
          <CaregiverNotificationBell />
          <CaregiverAccountMenu avatarUrl={avatarUrl} name={name} />
        </div>
      </div>
    </header>
  )
}
