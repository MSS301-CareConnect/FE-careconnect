import { useTranslation } from 'react-i18next'
import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { ADMIN_SIDEBAR_ID } from './admin-sidebar'

type AdminTopbarProps = {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function AdminTopbar({ menuOpen, onToggleMenu }: AdminTopbarProps) {
  const { t } = useTranslation()

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-6'>
        <button
          aria-controls={ADMIN_SIDEBAR_ID}
          aria-expanded={menuOpen}
          aria-label={t(menuOpen ? 'admin.closeMenu' : 'admin.openMenu')}
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden'
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
          <PortalAccountMenu fallbackName={t('admin.manager')} roleLabel={t('admin.role')} />
        </div>
      </div>
    </header>
  )
}
