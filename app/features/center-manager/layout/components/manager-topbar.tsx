import { useTranslation } from 'react-i18next'

import { OpsTopbar } from '~/features/shared/layout/ops-topbar'

import { MANAGER_SIDEBAR_ID } from './manager-sidebar'

export function ManagerTopbar({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const { t } = useTranslation()

  return (
    <OpsTopbar
      closeMenuLabel={t('centerManager.closeMenu')}
      fallbackName={t('centerManager.manager')}
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      openMenuLabel={t('centerManager.openMenu')}
      portal='center-manager'
      roleLabel={t('centerManager.role')}
      sidebarId={MANAGER_SIDEBAR_ID}
    />
  )
}
