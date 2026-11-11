import { useTranslation } from 'react-i18next'

import { OpsTopbar } from '~/features/shared/layout/ops-topbar'

import { ADMIN_SIDEBAR_ID } from './admin-sidebar'

type AdminTopbarProps = {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function AdminTopbar({ menuOpen, onToggleMenu }: AdminTopbarProps) {
  const { t } = useTranslation()

  return (
    <OpsTopbar
      closeMenuLabel={t('admin.closeMenu')}
      fallbackName={t('admin.manager')}
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      openMenuLabel={t('admin.openMenu')}
      portal='admin'
      profileLink={{ to: '/admin/profile', label: t('admin.profilePage.menu') }}
      roleLabel={t('admin.role')}
      securityLink='/admin/profile?tab=security'
      sidebarId={ADMIN_SIDEBAR_ID}
    />
  )
}
