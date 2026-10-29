import { useTranslation } from 'react-i18next'
import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { MANAGER_SIDEBAR_ID } from './manager-sidebar'

export function ManagerTopbar({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const { t } = useTranslation()

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-6'>
        <button
          aria-controls={MANAGER_SIDEBAR_ID}
          aria-expanded={menuOpen}
          aria-label={t(menuOpen ? 'centerManager.closeMenu' : 'centerManager.openMenu')}
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden'
          onClick={onToggleMenu}
          type='button'
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <div className='ml-auto flex shrink-0 items-center gap-2'>
          <div className='[&_button]:px-2'>
            <LanguageSwitch />
          </div>
          <NotificationBell />
          <PortalAccountMenu fallbackName={t('centerManager.manager')} roleLabel={t('centerManager.role')} />
        </div>
      </div>
    </header>
  )
}
