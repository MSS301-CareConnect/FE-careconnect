import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { caregiverPageTitleKey } from '../caregiver-navigation.constants'
import { CaregiverAccountMenu } from './caregiver-account-menu'
import { CaregiverNotificationBell } from './caregiver-notification-bell'

/**
 * Compact topbar. Phones show the brand mark and the section name (the page's H1 repeats it in larger type below);
 * desktop leaves the title to the page and keeps only the bell and the account menu, as white pills over a fade of the
 * page colour. No backdrop blur: it would become the containing block of the bell's fixed bottom sheet on phones.
 */
export function CaregiverTopbar({ avatarUrl, name }: { avatarUrl?: string; name?: string }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const titleKey = caregiverPageTitleKey(pathname)

  return (
    <header className='sticky top-0 z-30 print:hidden'>
      {/* A soft fade of the page colour instead of a bar: content scrolls away under it. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-surface via-surface/85 to-transparent'
      />
      <div className='relative mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem]'>
        <Link
          aria-label={t('common.brand')}
          className='flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-primary lg:hidden'
          to='/caregiver/today'
        >
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-900 text-mint-200 shadow-[var(--shadow-soft)]'>
            <Icon className='text-xl' filled name='volunteer_activism' />
          </span>
          <span className='truncate text-lg font-bold tracking-tight text-forest-950'>
            {t(`caregiver.nav.${titleKey}`)}
          </span>
        </Link>
        <span className='hidden lg:block' />
        <div className='flex shrink-0 items-center gap-2'>
          <CaregiverNotificationBell />
          <CaregiverAccountMenu avatarUrl={avatarUrl} name={name} />
        </div>
      </div>
    </header>
  )
}
