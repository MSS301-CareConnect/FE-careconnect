import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { findActiveManagerNavigation } from '../manager-navigation.constants'
import { MANAGER_SIDEBAR_ID } from './manager-sidebar'

export function ManagerTopbar({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = findActiveManagerNavigation(pathname)

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-6'>
        <div className='flex min-w-0 items-center gap-2'>
          <button
            aria-controls={MANAGER_SIDEBAR_ID}
            aria-expanded={menuOpen}
            aria-label={t(menuOpen ? 'centerManager.closeMenu' : 'centerManager.openMenu')}
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden'
            onClick={onToggleMenu}
            type='button'
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <nav aria-label={t('centerManager.breadcrumb')} className='min-w-0'>
            <ol className='flex min-w-0 items-center gap-1.5 text-sm'>
              <li className='hidden shrink-0 sm:block'>
                <Link className='text-outline hover:text-primary' to='/center-manager/caregivers'>
                  {t('centerManager.role')}
                </Link>
              </li>
              {active ? (
                <>
                  <li aria-hidden='true' className='hidden text-outline sm:block'>
                    <Icon className='text-base' name='chevron_right' />
                  </li>
                  <li className='hidden shrink-0 text-outline md:block'>
                    {t(`centerManager.groups.${active.group.key}`)}
                  </li>
                  <li aria-hidden='true' className='hidden text-outline md:block'>
                    <Icon className='text-base' name='chevron_right' />
                  </li>
                  <li aria-current='page' className='truncate font-semibold text-on-surface'>
                    {t(active.item.label)}
                  </li>
                </>
              ) : null}
            </ol>
          </nav>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <div className='[&_button]:px-2'>
            <LanguageSwitch />
          </div>
          <button
            aria-label={t('centerManager.notifications')}
            className='relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant disabled:cursor-not-allowed'
            disabled
            title={t('centerManager.unavailable')}
            type='button'
          >
            <Icon name='notifications' />
            <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-error' />
          </button>
          <PortalAccountMenu fallbackName={t('centerManager.manager')} roleLabel={t('centerManager.role')} />
        </div>
      </div>
    </header>
  )
}
